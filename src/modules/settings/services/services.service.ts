import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceDto } from './dto/service.dto';
import { ServiceCategoryDto } from './dto/service.category.dto';
import { ServiceCategory } from '../entities/service_category.entity';
import { Service } from '../entities/service.entity';
import { ServiceCategoryRepository } from './repositories/service_category.repository';
import { formatPID, slugify } from '../../../common/utils/utils';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { Raw } from 'typeorm';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { LabTestCategoryRepository } from '../lab/repositories/lab.category.repository';
import { LabTestRepository } from '../lab/repositories/lab.test.repository';
import { ServiceRepository } from './repositories/service.repository';
import { ServiceCostRepository } from './repositories/service_cost.repository';
import { ServiceCost } from '../entities/service_cost.entity';

@Injectable()
export class ServicesService {
    constructor(
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
        @InjectRepository(ServiceCategoryRepository)
        private serviceCategoryRepository: ServiceCategoryRepository,
        @InjectRepository(LabTestCategoryRepository)
        private labTestCategoryRepository: LabTestCategoryRepository,
        @InjectRepository(LabTestRepository)
        private labTestRepository: LabTestRepository,
        @InjectRepository(HmoSchemeRepository)
        private hmoSchemeRepository: HmoSchemeRepository,
        @InjectRepository(ServiceCostRepository)
        private serviceCostRepository: ServiceCostRepository,
    ) {
    }

    async getAllServices(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { q, hmo_id } = params;

        const page = options.page - 1;

        const hmo = await this.hmoSchemeRepository.findOne(hmo_id);

        let result;
        let total = 0;
        if (q && q.length > 0) {
            [result, total] = await this.serviceRepository.findAndCount({
                where: { name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) },
                relations: ['category'],
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
            });
        } else {
            [result, total] = await this.serviceRepository.findAndCount({
                relations: ['category'],
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
            });
        }

        let rs = [];
        for (const item of result) {
            item.service = await this.serviceCostRepository.findOne({ where: { code: item.code, hmo } });

            rs = [...rs, item];
        }

        return {
            result: rs,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
    }

    async getServiceById(id: string): Promise<Service> {
        const found = this.serviceRepository.findOne(id);

        if (!found) {
            throw new NotFoundException(`Service with ID '${id}' not found`);
        }

        return found;
    }

    async getServicesByCategory(slug: string, params): Promise<Service[]> {
        const { q } = params;

        const category = await this.serviceCategoryRepository.findOne({ where: { slug } });
        const hmo = await this.hmoSchemeRepository.findOne({ where: { name: 'Private' } });

        let query = [];
        if (q && q !== '') {
            query = await this.serviceRepository.find({
                where: { name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`), category },
                take: 20,
            });
        } else {
            query = await this.serviceRepository.find({
                where: { category },
                take: 20,
            });
        }

        let result = [];
        for (const item of query) {
            const serviceCost = await this.serviceCostRepository.findOne({
                where: { code: item.code, hmo },
            });

            result = [...result, { ...item, serviceCost }];
        }

        return result;
    }

    async createService(serviceDto: ServiceDto): Promise<Service> {
        const { category_id, tariff } = serviceDto;

        const category = await this.serviceCategoryRepository.findOne(category_id);

        const lastService = await this.serviceRepository.findOne({
            where: { category },
            order: { code: 'DESC' },
        });

        let alphaCode;
        let code;
        if (lastService) {
            alphaCode = lastService.code.substring(0, 2);
            const num = lastService.code.slice(2);
            const index = parseInt(num, 10) + 1;
            code = `${alphaCode.toLocaleUpperCase()}${formatPID(index, lastService.code.length - 2)}`;
        } else {
            const names = category.name.split(' ');
            alphaCode = names.length > 1 ? names.map(n => n.substring(0, 1)).join('') : category.name.substring(0, 2);
            code = `${alphaCode.toLocaleUpperCase()}${formatPID(1)}`;
        }

        const service = await this.serviceRepository.createService(serviceDto, category, code);

        const schemes = await this.hmoSchemeRepository.find();

        for (const scheme of schemes) {
            const serviceCost = new ServiceCost();
            serviceCost.code = service.code;
            serviceCost.item = service;
            serviceCost.hmo = scheme;
            serviceCost.tariff = tariff;

            await serviceCost.save();
        }

        return service;
    }

    async updateService(id: string, serviceDto: ServiceDto): Promise<any> {
        const { name, category_id, hmo_id } = serviceDto;

        const category = await this.serviceCategoryRepository.findOne(category_id);

        const service = await this.getServiceById(id);
        service.name = name;
        service.category = category;
        await service.save();

        const hmo = await this.hmoSchemeRepository.findOne(hmo_id);

        const cost = await this.serviceCostRepository.findOne({
            where: { code: service.code, hmo },
        });

        return { ...service, service: cost };
    }

    async deleteService(id: number, username: string): Promise<any> {
        const service = await this.serviceRepository.findOne(id);

        if (!service) {
            throw new NotFoundException(`Service with ID '${id}' not found`);
        }

        service.deletedBy = username;
        await service.save();

        return service.softRemove();
    }

    /*
        Service CATEGORY SERVICES
    */
    async getServicesCategory(): Promise<ServiceCategory[]> {
        return this.serviceCategoryRepository.find();
    }

    async getServicesCategoryBySlug(slug: string): Promise<ServiceCategory> {
        return this.serviceCategoryRepository.findOne({ where: { slug } });
    }

    async createServiceCategory(serviceCategoryDto: ServiceCategoryDto): Promise<ServiceCategory> {
        return this.serviceCategoryRepository.createCategory(serviceCategoryDto);
    }

    async updateServiceCategory(id: number, serviceCategoryDto: ServiceCategoryDto): Promise<ServiceCategory> {
        const { name } = serviceCategoryDto;
        const category = await this.serviceCategoryRepository.findOne(id);
        category.name = name;
        category.slug = slugify(name);
        await category.save();
        return category;
    }

    async deleteServiceCategory(id: number, username: string): Promise<any> {
        const category = await this.serviceCategoryRepository.findOne(id);

        if (!category) {
            throw new NotFoundException(`Service category with ID '${id}' not found`);
        }

        category.deletedBy = username;
        await category.save();

        return category.softRemove();
    }
}
