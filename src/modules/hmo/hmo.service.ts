import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HmoOwnerRepository } from './repositories/hmo.repository';
import { Hmo } from './entities/hmo.entity';
import { HmoDto } from './dto/hmo.dto';
import { TransactionsRepository } from '../finance/transactions/transactions.repository';
import * as moment from 'moment';
import { getConnection, Like, Raw } from 'typeorm';
import { PaginationOptionsInterface } from '../../common/paginate';
import { Pagination } from '../../common/paginate/paginate.interface';
import { PatientRepository } from '../patient/repositories/patient.repository';
import { HmoSchemeDto } from './dto/hmo_scheme.dto';
import { HmoSchemeRepository } from './repositories/hmo_scheme.repository';
import { HmoTypeRepository } from './repositories/hmo_type.repository';
import { HmoScheme } from './entities/hmo_scheme.entity';
import { HmoType } from './entities/hmo_type.entity';
import { ServiceCostRepository } from '../settings/services/repositories/service_cost.repository';
import { PatientRequestItemRepository } from '../patient/repositories/patient_request_items.repository';
import { MigrationService } from '../migration/migration.service';
import { Patient } from '../patient/entities/patient.entity';
import { ServiceCategoryRepository } from '../settings/services/repositories/service_category.repository';

@Injectable()
export class HmoService {
    constructor(
        private migrationService: MigrationService,
        @InjectRepository(HmoOwnerRepository)
        private hmoOwnerRepository: HmoOwnerRepository,
        @InjectRepository(HmoSchemeRepository)
        private hmoSchemeRepository: HmoSchemeRepository,
        @InjectRepository(HmoTypeRepository)
        private hmoTypeRepository: HmoTypeRepository,
        @InjectRepository(TransactionsRepository)
        private transactionsRepository: TransactionsRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(ServiceCostRepository)
        private serviceCostRepository: ServiceCostRepository,
        @InjectRepository(PatientRequestItemRepository)
        private patientRequestItemRepository: PatientRequestItemRepository,
        @InjectRepository(ServiceCategoryRepository)
        private serviceCategoryRepository: ServiceCategoryRepository,
    ) {
    }

    async fetchHmos(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { q } = params;

        let searchParam = {};
        if (q && q !== '') {
            searchParam = {
                where: {
                    name: Like(`%${q}%`),
                },
            };
        }

        const page = options.page - 1;

        const [result, total] = await this.hmoOwnerRepository.findAndCount({
            ...searchParam,
            take: options.limit,
            skip: (page * options.limit),
        });

        return {
            result,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
    }

    async fetchSchemes(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { q } = params;

        let searchParam = {};
        if (q && q !== '') {
            searchParam = {
                where: {
                    name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`),
                },
            };
        }

        const page = options.page - 1;

        const [query, total] = await this.hmoSchemeRepository.findAndCount({
            ...searchParam,
            take: options.limit,
            skip: (page * options.limit),
        });

        let result = [];
        for (const item of query) {
            const patients = await getConnection().getRepository(Patient).count({ hmo: item });
            result = [...result, { ...item, patients }];
        }

        return {
            result,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
    }

    async fetchScheme(name): Promise<HmoScheme> {
        return this.hmoSchemeRepository.findOne({ where: { name } });
    }

    async createHmo(hmoDto: HmoDto, username: string): Promise<Hmo> {
        return this.hmoOwnerRepository.saveHmo(hmoDto, username);
    }

    async updateHmo(id: string, hmoDto: HmoDto, username: string): Promise<any> {
        const { name, address, phoneNumber, email } = hmoDto;
        const hmo = await this.hmoOwnerRepository.findOne(id);

        if (!hmo) {
            return { success: false, message: `HMO with ${id} was not found` };
        }

        hmo.name = name;
        hmo.address = address;
        hmo.phoneNumber = phoneNumber;
        hmo.email = email;
        hmo.lastChangedBy = username;
        await hmo.save();

        return hmo;
    }

    async deleteHmo(id: number, username): Promise<Hmo> {
        // delete hmo
        const data = await this.hmoOwnerRepository.findOne(id);

        if (!data) {
            throw new NotFoundException(`HMO with ID '${id}' not found`);
        }

        data.deletedBy = username;
        await data.save();

        return data.softRemove();
    }

    async createScheme(hmoSchemeDto: HmoSchemeDto, username: string): Promise<HmoScheme> {
        try {
            let hmoCompany;
            if (hmoSchemeDto.hmo_id === '') {
                const item = new Hmo();
                item.name = hmoSchemeDto.hmo.label;
                item.phoneNumber = hmoSchemeDto.phoneNumber;
                item.address = hmoSchemeDto.address;
                item.email = hmoSchemeDto.email;
                item.createdBy = username;
                hmoCompany = await item.save();
            } else {
                hmoCompany = await this.hmoOwnerRepository.findOne(hmoSchemeDto.hmo_id);
            }

            const type = await this.hmoTypeRepository.findOne(hmoSchemeDto.hmo_type_id);

            const scheme = await this.hmoSchemeRepository.saveScheme(hmoSchemeDto, hmoCompany, type, username);

            return scheme;
        } catch (error) {
            console.log(error);
            throw new BadRequestException(error);
        }
    }

    async updateScheme(id: string, hmoSchemeDto: HmoSchemeDto, username: string): Promise<any> {
        const { name, address, phoneNumber, email, cacNumber, coverageType, logo, hmo_type_id } = hmoSchemeDto;

        const scheme = await this.hmoSchemeRepository.findOne(id);

        if (!scheme) {
            return { success: false, message: `HMO Scheme with ${id} was not found` };
        }

        try {
            let hmoCompany;
            if (hmoSchemeDto.hmo_id === '') {
                const item = new Hmo();
                item.name = hmoSchemeDto.hmo.label;
                item.phoneNumber = hmoSchemeDto.phoneNumber;
                item.address = hmoSchemeDto.address;
                item.email = hmoSchemeDto.email;
                item.createdBy = username;
                hmoCompany = await item.save();
            } else {
                hmoCompany = await this.hmoOwnerRepository.findOne(hmoSchemeDto.hmo_id);
            }

            const type = await this.hmoTypeRepository.findOne(hmo_type_id);

            scheme.name = name;
            scheme.logo = logo;
            scheme.address = address;
            scheme.phoneNumber = phoneNumber;
            scheme.email = email;
            scheme.cacNumber = cacNumber;
            scheme.coverageType = coverageType;
            scheme.owner = hmoCompany;
            scheme.hmoType = type;
            scheme.lastChangedBy = username;
            const rs = await scheme.save();

            return { success: true, scheme: rs };
        } catch (e) {
            console.log(e);
            return { success: false, message: 'error, could not save hmo scheme' };
        }
    }

    async deleteScheme(id: number, username): Promise<Hmo> {
        const data = await this.hmoSchemeRepository.findOne(id);

        if (!data) {
            throw new NotFoundException(`HMO with ID '${id}' not found`);
        }

        data.deletedBy = username;
        await data.save();

        return data.softRemove();
    }

    async fetchTransactions(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { startDate, endDate, patient_id, hmo_id, status, service_id } = params;

        const query = this.transactionsRepository.createQueryBuilder('q')
            .where('q.payment_type = :type', { type: 'HMO' })
            .select('q.*');

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }

        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }

        if (hmo_id && hmo_id !== '') {
            query.andWhere('q.hmo_scheme_id = :hmo_id', { hmo_id });
        }

        if (patient_id && patient_id !== '') {
            query.andWhere('q.patient_id = :patient_id', { patient_id });
        }

        if (status) {
            query.andWhere('q.status = :status', { status });
        }

        if (service_id && service_id !== '') {
            let bill_source = '';

            if (service_id === 'credit') {
                bill_source = 'credit-deposit';
            } else if (service_id === 'transfer') {
                bill_source = 'credit-transfer';
            } else if (service_id === 'cafeteria') {
                bill_source = 'cafeteria';
            } else {
                const serviceCategory = await this.serviceCategoryRepository.findOne(service_id);
                bill_source = serviceCategory?.slug || '';
            }

            if (bill_source && bill_source !== '') {
                query.andWhere('t.bill_source = :bill_source', { bill_source });
            }
        }

        const page = options.page - 1;

        const items = await query.offset(page * options.limit)
            .limit(options.limit)
            .orderBy('q.createdAt', 'DESC')
            .getRawMany();

        const total = await query.getCount();

        let result = [];
        for (const item of items) {
            item.scheme = await this.hmoSchemeRepository.findOne(item.hmo_scheme_id);

            const patient = await this.patientRepository.findOne(item.patient_id, {
                relations: ['nextOfKin', 'immunization', 'hmo'],
            });

            item.patient = patient;

            if (item.service_cost_id) {
                item.service = await this.serviceCostRepository.findOne(item.service_cost_id);
            }

            if (item.patient_request_item_id) {
                item.patientRequestItem = await this.patientRequestItemRepository.findOne(item.patient_request_item_id, { relations: ['request'] });
            }

            result = [...result, item];
        }

        return {
            result,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
    }

    async getHmoTypes(): Promise<HmoType[]> {
        return await this.hmoTypeRepository.find();
    }
}
