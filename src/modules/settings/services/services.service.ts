import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceDto } from './dto/service.dto';
import { ServiceCategoryDto } from './dto/service.category.dto';
import { ServiceCategory } from '../entities/service_category.entity';
import { Service } from '../entities/service.entity';
import { ServiceCategoryRepository } from './repositories/service_category.repository';
import { slugify } from '../../../common/utils/utils';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { Raw } from 'typeorm';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { LabTestCategoryRepository } from '../lab/repositories/lab.category.repository';
import { LabTestRepository } from '../lab/repositories/lab.test.repository';
import { ServiceRepository } from './repositories/service.repository';
import { ServiceCostRepository } from './repositories/service_cost.repository';

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
        const { category_id } = serviceDto;

        const category = await this.serviceCategoryRepository.findOne(category_id);

        return this.serviceRepository.createService(serviceDto, category);
    }

    async updateService(id: string, serviceDto: ServiceDto): Promise<Service> {
        const { name, category_id } = serviceDto;
        const category = await this.serviceCategoryRepository.findOne(category_id);

        const service = await this.getServiceById(id);
        service.name = name;
        service.category = category;
        await service.save();

        return service;
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
