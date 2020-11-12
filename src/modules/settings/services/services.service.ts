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
import { LabTestCategory } from '../entities/lab_test_category.entity';
import { LabTestDto } from '../lab/dto/lab_test.dto';
import { slugify } from '../../../common/utils/utils';
import { Hmo } from 'src/modules/hmo/entities/hmo.entity';

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

    async getServicesByCategory(category_id: string): Promise<Service[]> {
        // find consultation category
        const category = await this.serviceCategoryRepository.findOne(category_id);
        // find services
        const services = await this.serviceRepository.find({where: {category}});

        return services;
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

    async doUploadServices(file: any, username: string) {
        const csv = require('csv-parser');
        const fs = require('fs');
        const content = [];
        const labs = [];
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
                    hmo: row.Hmo,
                    hmoAmount: row.HmoAmount
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
                    let hmo;
                    // check if category exists
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

                    if(item.hmo){
                        hmo = await this.hmoRepository.findOne({where : {name: item.hmo.trim()}});

                        if(!hmo){
                            hmo = await this.hmoRepository.save({name: item.hmo.trim()})
                        }
                    }

                    const service = await this.serviceRepository.findOne({where : {slug: slugify(item.service)}});
                    if (!service) {
                        // save service
                        await this.serviceRepository.save({
                            name: item.service,
                            slug: slugify(item.service),
                            tariff: item.amount.replace(',', ''),
                            category,
                            subCategory: (subCategory) ? subCategory : null,
                            hmo: hmo? hmo : null,
                            hmoTarrif: item.hmoAmount? item.hmoAmount.replace(',', '') : null
                        });
                    }
                }

                for (const test of labs) {
                    let category;
                    let hmo;

                    category = await this.labTestCategoryRepository.findOne({where : {name: test.subCategory}});
                    if (!category) {
                        category = await this.labTestCategoryRepository.saveCategory({name: test.subCategory}, username);
                    }

                    if(test.hmo){
                        hmo = await this.hmoRepository.findOne({where : {name: test.hmo.trim()}});

                        if(!hmo){
                            hmo = await this.hmoRepository.save({name: test.hmo.trim()})
                        }
                    }

                    const findTest = await this.labTestRepository.findOne({where : {slug: slugify(test.service)}});
                    if (!findTest) {
                        const labTest = {
                            name: test.service,
                            slug: slugify(test.service),
                            price: test.amount.replace(',', ''),
                            test_type: null,
                            description: null,
                            parameters: null,
                            sub_tests: null,
                            lab_category_id: category.id,
                            hmo: hmo? hmo : null,
                            hmoTarrif: test.hmoAmount? test.hmoAmount.replace(',', '') : null
                        };

                        await this.labTestRepository.saveLabTest(labTest, category, username);
                    }
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
                {id: 'slug', title: 'Slug'},
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
