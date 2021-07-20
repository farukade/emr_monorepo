import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NicuRepository } from './nicu.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import * as moment from 'moment';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { getConnection } from 'typeorm';
import { Transactions } from '../../finance/transactions/transaction.entity';
import { NicuAccommodationRepository } from '../../settings/nicu-accommodation/accommodation.repository';

@Injectable()
export class NicuService {
    constructor(
        @InjectRepository(NicuRepository)
        private nicuRepository: (NicuRepository),
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
        @InjectRepository(AdmissionsRepository)
        private admissionsRepository: AdmissionsRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(NicuAccommodationRepository)
        private nicuAccommodationRepository: NicuAccommodationRepository,
    ) {
    }

    async getEnrollments(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { startDate, endDate, patient_id, status, type, name } = params;
        const query = this.nicuRepository.createQueryBuilder('q')
            .leftJoinAndSelect('q.patient', 'patient')
            .select('q.id, q.createdAt as admission_date, q.createdBy as admitted_by, q.status, q.accommodation_id')
            .addSelect('CONCAT(patient.other_names || \' \' || patient.surname) as patient_name, patient.id as patient_id, patient.gender as patient_gender');

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }

        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }

        if (patient_id && patient_id !== '') {
            query.andWhere('q.patient = :patient_id', { patient_id });
        }

        if (status) {
            query.andWhere('q.status = :status', { status });
        }

        if (name) {
            query.where('q.patient_name like :name', { name: `%${name}%` });
        }

        const page = options.page - 1;

        const admissions = await query.offset(page * options.limit)
            .limit(options.limit)
            .orderBy('q.createdAt', 'DESC')
            .getRawMany();

        const total = await query.getCount();

        let result = [];
        for (const item of admissions) {
            if (item.patient_id) {
                item.patient = await this.patientRepository.findOne(item.patient_id, { relations: ['nextOfKin', 'immunization', 'hmo'] });
            }

            item.admission = await this.admissionsRepository.findOne(item.admission_id);

            if (item.accommodation_id) {
                item.accommodation = await this.nicuAccommodationRepository.findOne(item.accommodation_id);
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

    async saveAccommodation(id, params, createdBy: string) {
        try {
            const { slug, patient_id } = params;

            // find accommodation
            const accommodation = await this.nicuAccommodationRepository.findOne({ where: { slug } });

            const nicu = await this.nicuRepository.findOne(id);
            nicu.accommodation = accommodation;
            const rs = await nicu.save();

            const patient = await this.patientRepository.findOne(patient_id, { relations: ['hmo'] });

            // add transaction
            const data = {
                patient,
                amount: accommodation.amount,
                description: `Payment for ${accommodation.name} - Nicu`,
                payment_type: (patient.hmo.name !== 'Private') ? 'HMO' : '',
                bill_source: 'nicu-accommodation',
                is_admitted: true,
                transaction_details: accommodation,
                createdBy,
                status: 0,
                hmo: patient.hmo,
                transaction_type: 'debit',
                balance: accommodation.amount * -1,
            };

            await this.save(data);

            return { success: true, nicu: { ...rs, accommodation } };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async save(data) {
        return await getConnection()
            .createQueryBuilder()
            .insert()
            .into(Transactions)
            .values(data)
            .execute();
    }
}
