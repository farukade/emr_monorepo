import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceDto } from './dto/service.dto';
import { ServiceCategoryDto } from './dto/service.category.dto';
import { ServiceCategory } from '../entities/service_category.entity';
import { Service } from '../entities/service.entity';
import { ServiceCategoryRepository } from './Service.category.repository';
import { ServiceRepository } from './service.repository';

@Injectable()
export class ServicesService {
    constructor(
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
        @InjectRepository(ServiceCategoryRepository)
        private serviceCategoryRepository: ServiceCategoryRepository,
    ) {}

    async getAllServices(): Promise<Service[]> {
        return this.serviceRepository.find({relations: ['category']});
    }

    async getServiceById(id: string): Promise<Service> {
        const found = this.serviceRepository.findOne(id);

        if (!found) {
            throw new NotFoundException(`Service with ID '${id}' not found`);
        }

        return found;
    }

    async createService(serviceDto: ServiceDto): Promise<Service> {
        const { service_category_id } = serviceDto;
        let category;
        if (service_category_id) {
            category = await this.serviceCategoryRepository.findOne(service_category_id);
        }
        return this.serviceRepository.createService(serviceDto, category);
    }

    async updateService(id: string, serviceDto: ServiceDto): Promise<Service> {
        const { name, tariff, service_category_id } = serviceDto;
        const service = await this.getServiceById(id);
        const category = await this.serviceCategoryRepository.findOne(service_category_id);
        service.name = name;
        service.tariff = tariff;
        service.category = category;
        await service.save();
        return service;
    }

    async deleteService(id: string): Promise<void> {
        const result = await this.serviceRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Service with ID '${id}' not found`);
        }
    }

    /*
        Service CATEGORY SERVICES
    */

    async getServicesCategory(): Promise<ServiceCategory[]> {
        return this.serviceCategoryRepository.find({relations: ['services']});
    }

    async createServiceCategory(serviceCategoryDto: ServiceCategoryDto): Promise<ServiceCategory> {
        return this.serviceCategoryRepository.createCategory(serviceCategoryDto);
    }

    async updateServiceCategory(id: string, serviceCategoryDto: ServiceCategoryDto): Promise<ServiceCategory> {
        const { name } = serviceCategoryDto;
        const category = await this.serviceCategoryRepository.findOne(id);
        category.name = name;
        await category.save();
        return category;
    }

    async deleteServiceCategory(id: string): Promise<void> {
        const result = await this.serviceCategoryRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Service category with ID '${id}' not found`);
        }
    }
}
