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
import { HmoRepository } from '../../hmo/hmo.repository';
import { LabTestCategoryRepository } from '../lab/lab.category.repository';
import { LabTestRepository } from '../lab/lab.test.repository';
import { slugify } from '../../../common/utils/utils';
import { ServicesUploadRateDto } from './dto/service.upload.dto';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { Raw } from 'typeorm';

@Injectable()
export class ServicesService {
    constructor(
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
        @InjectRepository(ServiceCategoryRepository)
        private serviceCategoryRepository: ServiceCategoryRepository,
        @InjectRepository(ServiceSubCategoryRepository)
        private serviceSubCategoryRepository: ServiceSubCategoryRepository,
        @InjectRepository(LabTestCategoryRepository)
        private labTestCategoryRepository: LabTestCategoryRepository,
        @InjectRepository(LabTestRepository)
        private labTestRepository: LabTestRepository,
        @InjectRepository(HmoRepository)
        private hmoRepository: HmoRepository,
    ) {
    }

    async getAllServices(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { q } = params;

        const page = options.page - 1;

        let result;
        let total = 0;
        if (q && q.length > 0) {
            [result, total] = await this.serviceRepository.findAndCount({
                where: { name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) },
                relations: ['category', 'subCategory', 'hmo'],
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
            });
        } else {
            [result, total] = await this.serviceRepository.findAndCount({
                relations: ['category', 'subCategory', 'hmo'],
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
            });
        }

        return {
            result,
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

    async getConsultationServices() {
        // find consultation category
        const category = await this.serviceCategoryRepository.findOne({ where: { name: 'Consultation' } });

        // find services
        const services = await this.serviceRepository.find({ where: { category } });

        return services;
    }

    async getServicesByCategory(category_id: number, hmo_id: number): Promise<Service[]> {
        const hmo = await this.hmoRepository.findOne(hmo_id);

        // find consultation category
        const category = await this.serviceCategoryRepository.findOne(category_id);

        // find services
        return await this.serviceRepository.find({ where: { category, hmo } });
    }

    async createService(serviceDto: ServiceDto): Promise<Service> {
        const { category_id, sub_category_id, hmo_id } = serviceDto;
        const category = await this.serviceCategoryRepository.findOne(category_id);
        const subCategory = await this.serviceSubCategoryRepository.findOne(sub_category_id);
        const hmo = await this.hmoRepository.findOne(hmo_id);
        return this.serviceRepository.createService(serviceDto, category, subCategory, hmo);

    }

    async updateService(id: string, serviceDto: ServiceDto): Promise<Service> {
        const { name, tariff, sub_category_id, category_id, noOfVisits, gracePeriod, note } = serviceDto;
        const category = await this.serviceCategoryRepository.findOne(category_id);

        const subCategory = await this.serviceSubCategoryRepository.findOne(sub_category_id);

        const service = await this.getServiceById(id);
        service.name = name;
        service.tariff = tariff;
        service.category = category;
        service.subCategory = subCategory;
        service.gracePeriod = gracePeriod;
        service.noOfVisits = noOfVisits;
        service.note = note;
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

    async doUploadServices(uploadDto: ServicesUploadRateDto, file: any) {
        const csv = require('csv-parser');
        const fs = require('fs');
        const content = [];
        const labs = [];
        let results = [];

        const { hmo_id, username } = uploadDto;

        if (!hmo_id) {
            return { success: false, message: 'Select HMO' };
        }

        const hmo = await this.hmoRepository.findOne(hmo_id);

        try {
            // read uploaded file
            fs.createReadStream(file.path)
                .pipe(csv())
                .on('data', async (row) => {
                    const data = {
                        category: row.Category,
                        subCategory: row.SubCategory,
                        service: row.Service,
                        amount: row.Amount,
                        hmoAmount: row.HmoAmount,
                    };

                    if (data.category === 'Clinical Laboratory') {
                        labs.push(data);
                    } else {
                        content.push(data);
                    }
                })
                .on('end', async () => {
                    console.log('CSV file successfully processed');
                    for (const item of content) {
                        let category;
                        let subCategory;

                        // check if category exists
                        category = await this.serviceCategoryRepository.findOne({ where: { name: item.category.trim() } });
                        if (!category) {
                            category = await this.serviceCategoryRepository.save({ name: item.category.trim() });
                        }
                        if (item.subCategory) {
                            // console.log(category.id);
                            // check if sub category exists
                            subCategory = await this.serviceSubCategoryRepository.findOne({
                                where: {
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

                        const service = await this.serviceRepository.findOne({
                            where: { slug: slugify(item.service), hmo },
                            relations: ['category', 'subCategory', 'hmo'],
                        });

                        if (!service) {
                            // save service
                            const query = await this.serviceRepository.save({
                                name: item.service,
                                slug: slugify(item.service),
                                tariff: item.amount.replace(',', ''),
                                category,
                                subCategory: (subCategory) ? subCategory : null,
                                hmo,
                                hmoTarrif: (item.hmoAmount || item.amount).replace(',', ''),
                            });

                            query.hmo = hmo;
                            query.category = category;
                            query.subCategory = subCategory;

                            results = [...results, query];
                        } else {
                            results = [...results, service];
                        }
                    }

                    for (const test of labs) {
                        let category;
                        category = await this.labTestCategoryRepository.findOne({ where: { name: test.subCategory } });
                        if (!category) {
                            category = await this.labTestCategoryRepository.saveCategory({ name: test.subCategory }, username);
                        }

                        const findTest = await this.labTestRepository.findOne({ where: { slug: slugify(test.service), hmo } });
                        if (!findTest) {
                            const labTest = {
                                name: test.service,
                                slug: slugify(test.service),
                                price: test.amount.replace(',', ''),
                                test_type: null,
                                description: null,
                                parameters: [],
                                specimens: [],
                                lab_category_id: category.id,
                                hmoPrice: (test.hmoAmount || test.amount).replace(',', ''),
                                hasParameters: false,
                                hmo_id: hmo.id,
                            };

                            await this.labTestRepository.saveLabTest(labTest, category, username, hmo);
                        }
                    }
                });

            return { success: true, results };
        } catch (err) {
            console.log(err);
            return { success: false, message: err.message };
        }
    }

    async downloadServices() {
        const fs = require('fs');
        const createCsvWriter = require('csv-writer').createObjectCsvWriter;
        const csvWriter = createCsvWriter({
            path: 'services.csv',
            header: [
                { id: 'category', title: 'Category' },
                { id: 'sub_category', title: 'SubCategory' },
                { id: 'slug', title: 'Slug' },
                { id: 'name', title: 'Service' },
                { id: 'amount', title: 'Amount' },
                { id: 'hmo_rate', title: 'HMO Rate' },
            ],
        });

        const services = await this.serviceRepository.find({ relations: ['subCategory', 'category', 'hmo'] });

        if (services.length) {
            for (const service of services) {
                const data = [
                    {
                        category: service.category.name,
                        sub_category: (service.subCategory) ? service.subCategory.name : '',
                        slug: service.slug,
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
        return this.serviceCategoryRepository.find({ relations: ['services', 'subCategories'] });
    }

    async getServicesCategoryByName(name: string): Promise<ServiceCategory> {
        return await this.serviceCategoryRepository.findOne({ where: { name } });
    }

    async createServiceCategory(serviceCategoryDto: ServiceCategoryDto): Promise<ServiceCategory> {
        return this.serviceCategoryRepository.createCategory(serviceCategoryDto);
    }

    async updateServiceCategory(id: number, serviceCategoryDto: ServiceCategoryDto): Promise<ServiceCategory> {
        const { name, notes } = serviceCategoryDto;
        const category = await this.serviceCategoryRepository.findOne(id);
        category.name = name;
        category.notes = notes;
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

    /*
        SERVICE SUB CATEGORY
    */

    async getSubCategories(categoryID: string): Promise<ServiceSubCategory[]> {
        return this.serviceSubCategoryRepository.find({ where: { service_category_id: categoryID } });
    }

    async createSubCategory(serviceSubCategoryDto: ServiceSubCategoryDto): Promise<ServiceSubCategory> {
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

    async deleteSubCategory(id: number, username: string): Promise<any> {
        const category = await this.serviceSubCategoryRepository.findOne(id);

        if (!category) {
            throw new NotFoundException(`Service sub category with ID '${id}' not found`);
        }

        category.deletedBy = username;
        await category.save();

        return category.softRemove();
    }
}
