import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceDto } from './dto/service.dto';
import { ServiceCategoryDto } from './dto/service.category.dto';
import { ServiceCategory } from '../entities/service_category.entity';
import { Service } from '../entities/service.entity';
import { ServiceCategoryRepository } from './service.category.repository';
import { ServiceSubCategoryRepository } from './service.sub.category.repository';
import { ServiceRepository } from './service.repository';
import { ServiceSubCategory } from '../entities/service_sub_category.entity';
import { ServiceSubCategoryDto } from './dto/service.sub.category.dto';

@Injectable()
export class ServicesService {
    constructor(
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
        @InjectRepository(ServiceCategoryRepository)
        private serviceCategoryRepository: ServiceCategoryRepository,
        @InjectRepository(ServiceSubCategoryRepository)
        private serviceSubCategoryRepository: ServiceSubCategoryRepository,
    ) {}

    async getAllServices(): Promise<Service[]> {
        return this.serviceRepository.find({relations: ['category', 'subCategory']});
    }

    async getServiceById(id: string): Promise<Service> {
        const found = this.serviceRepository.findOne(id);

        if (!found) {
            throw new NotFoundException(`Service with ID '${id}' not found`);
        }

        return found;
    }

    async getConsultationServices() {
        // find consultation category
        const category = await this.serviceCategoryRepository.findOne({where: {name: 'Consultation'}});
        // find services
        const services = await this.serviceRepository.find({where: {category}});

        return services;
    }

    async createService(serviceDto: ServiceDto): Promise<Service> {
        const { category_id, sub_category_id } = serviceDto;
        const category = await this.serviceCategoryRepository.findOne(category_id);
        const subCategory = await this.serviceSubCategoryRepository.findOne(sub_category_id);
        return this.serviceRepository.createService(serviceDto, category, subCategory);

    }

    async updateService(id: string, serviceDto: ServiceDto): Promise<Service> {
        const { name, tariff, sub_category_id, category_id, noOfVisits, gracePeriod, note } = serviceDto;
        const category      = await this.serviceCategoryRepository.findOne(category_id);

        const subCategory   = await this.serviceSubCategoryRepository.findOne(sub_category_id);

        const service       = await this.getServiceById(id);
        service.name        = name;
        service.tariff      = tariff;
        service.category    = category;
        service.subCategory = subCategory;
        service.gracePeriod = gracePeriod;
        service.noOfVisits  = noOfVisits;
        service.note        = note;
        await service.save();

        return service;
    }

    async deleteService(id: string): Promise<void> {
        const result = await this.serviceRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Service with ID '${id}' not found`);
        }
    }

    async doUploadServices(file: any) {
        const csv = require('csv-parser');
        const fs = require('fs');
        const content = [];
        try {
            // read uploaded file
            fs.createReadStream(file.path)
            .pipe(csv())
            .on('data', (row) => {
                const data = {
                    category: row.Category,
                    subCategory: row.SubCategory,
                    service: row.Service,
                    amount: row.Amount,
                };
                content.push(data);
            })
            .on('end', async () => {
                console.log('CSV file successfully processed');
                for (const item of content) {
                    let category, subCategory;
                    // check if faculty exists
                    category = await this.serviceCategoryRepository.findOne({where : {name: item.category.trim()}});
                    if (!category) {
                        category = await this.serviceCategoryRepository.save({name: item.category.trim()});
                    }
                    if (item.subCategory) {
                        // console.log(category.id);
                        // check if sub category exists
                        subCategory = await this.serviceSubCategoryRepository.findOne({
                            where : {
                                category,
                                name: item.subCategory.trim(),
                            },
                        });
                        if (!subCategory) {
                            // save department
                            subCategory = await this.serviceSubCategoryRepository.save({
                                name: item.subCategory.trim(),
                                category,
                            });
                        }
                    }
                    // save service
                    await this.serviceRepository.save({
                        name: item.service,
                        code: 'DH' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6).toUpperCase(),
                        tariff: item.amount.replace(',', ''),
                        category,
                        subCategory: (subCategory) ? subCategory : null,
                    });
                }
            });
            return {success: true};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async downloadServices() {
        const fs = require('fs');
        const createCsvWriter = require('csv-writer').createObjectCsvWriter;
        const csvWriter = createCsvWriter({
            path: 'services.csv',
            header: [
                {id: 'category', title: 'Category'},
                {id: 'sub_category', title: 'SubCategory'},
                {id: 'code', title: 'Code'},
                {id: 'name', title: 'Service'},
                {id: 'amount', title: 'Amount'},
                // {id: 'hmo_rate', title: 'HMO Rate'},
            ],
        });

        const services = await this.serviceRepository.find({relations: ['subCategory', 'category']});

        if (services.length) {
            for (const service of services) {
                const data = [
                    {
                        category: service.category.name,
                        sub_category: (service.subCategory) ? service.subCategory.name : '',
                        code: service.code,
                        name: service.name,
                        amount: service.tariff,
                        hmo_rate: '',
                    },
                ];

                await csvWriter.writeRecords(data);
            }
        } else {
            const data = [
                {
                    category: '',
                    sub_category: '',
                    code: '',
                    name: '',
                    amount: '',
                    hmo_rate: '',
                },
            ];
            await csvWriter.writeRecords(data);
        }
        return 'Completed';
    }

    /*
        Service CATEGORY SERVICES
    */

    async getServicesCategory(): Promise<ServiceCategory[]> {
        return this.serviceCategoryRepository.find({relations: ['services', 'subCateogries']});
    }

    async createServiceCategory(serviceCategoryDto: ServiceCategoryDto): Promise<ServiceCategory> {
        return this.serviceCategoryRepository.createCategory(serviceCategoryDto);
    }

    async updateServiceCategory(id: string, serviceCategoryDto: ServiceCategoryDto): Promise<ServiceCategory> {
        const { name, notes } = serviceCategoryDto;
        const category = await this.serviceCategoryRepository.findOne(id);
        category.name = name;
        category.notes = notes;
        await category.save();
        return category;
    }

    async deleteServiceCategory(id: string): Promise<void> {
        const result = await this.serviceCategoryRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Service category with ID '${id}' not found`);
        }
    }

    /*
        SERVICE SUB CATEGORY
    */

    async getSubCategories(categoryID: string): Promise<ServiceSubCategory[]> {
        return this.serviceSubCategoryRepository.find({where: {service_category_id: categoryID}});
    }

    async createSubCategory( serviceSubCategoryDto: ServiceSubCategoryDto): Promise<ServiceSubCategory> {
        const { service_category_id } = serviceSubCategoryDto;
        const category = await this.serviceCategoryRepository.findOne(service_category_id);

        return this.serviceSubCategoryRepository.saveCategory(serviceSubCategoryDto, category);
    }

    async updateSubCategory(id: string, serviceSubCategoryDto: ServiceSubCategoryDto): Promise<ServiceSubCategory> {
        const { name, service_category_id } = serviceSubCategoryDto;
        const category = await this.serviceCategoryRepository.findOne(service_category_id);
        const subCategory = await this.serviceSubCategoryRepository.findOne(id);
        subCategory.name = name;
        subCategory.category = category;
        await category.save();
        return subCategory;
    }

    async deleteSubCategory(id: string): Promise<void> {
        const result = await this.serviceSubCategoryRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Service sub category with ID '${id}' not found`);
        }
    }
}
