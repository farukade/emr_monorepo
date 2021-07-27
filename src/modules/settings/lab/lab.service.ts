import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LabTest } from '../entities/lab_test.entity';
import { LabTestCategory } from '../entities/lab_test_category.entity';
import { LabCategoryDto } from './dto/lab.category.dto';
import { Parameter } from '../entities/parameters.entity';
import { ParameterDto } from './dto/parameter.dto';
import { LabTestDto } from './dto/lab_test.dto';
import { Specimen } from '../entities/specimen.entity';
import { SpecimenDto } from './dto/specimen.dto';
import { Group } from '../entities/group.entity';
import { GroupDto } from './dto/group.dto';
import { slugify } from '../../../common/utils/utils';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { getConnection, Like, Raw } from 'typeorm';
import { GroupTest } from '../entities/group_tests.entity';
import { LabTestCategoryRepository } from './repositories/lab.category.repository';
import { LabTestRepository } from './repositories/lab.test.repository';
import { ParameterRepository } from './repositories/parameter.repository';
import { SpecimenRepository } from './repositories/specimen.repository';
import { GroupRepository } from './repositories/group.repository';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { GroupTestRepository } from './repositories/group_tests.repository';
import { ServiceCostRepository } from '../services/repositories/service_cost.repository';

@Injectable()
export class LabService {
    constructor(
        @InjectRepository(LabTestCategoryRepository)
        private labTestCategoryRepo: LabTestCategoryRepository,
        @InjectRepository(LabTestRepository)
        private labTestRepository: LabTestRepository,
        @InjectRepository(ParameterRepository)
        private parameterRepository: ParameterRepository,
        @InjectRepository(SpecimenRepository)
        private specimenRepository: SpecimenRepository,
        @InjectRepository(GroupRepository)
        private groupRepository: GroupRepository,
        @InjectRepository(HmoSchemeRepository)
        private hmoSchemeRepository: HmoSchemeRepository,
        @InjectRepository(GroupTestRepository)
        private groupTestRepository: GroupTestRepository,
        @InjectRepository(ServiceCostRepository)
        private serviceCostRepository: ServiceCostRepository,
    ) {
    }

    /*
        LAB TESTS
    */

    async getTests(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { q, hmo_id } = params;

        const page = options.page - 1;

        const hmo = await this.hmoSchemeRepository.findOne(hmo_id);

        let result;
        let total = 0;
        if (q && q.length > 0) {
            [result, total] = await this.labTestRepository.findAndCount({
                where: { name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) },
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
            });
        } else {
            [result, total] = await this.labTestRepository.findAndCount({
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

    async getTestsUnpaginated(params): Promise<any> {
        const { q } = params;

        let result;
        if (q && q.length > 0) {
            result = await this.labTestRepository.find({
                where: { name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) },
                order: { name: 'ASC' },
            });
        } else {
            result = await this.labTestRepository.find({
                order: { name: 'ASC' },
            });
        }

        return { success: true, result };
    }

    async createLabTest(labTestDto: LabTestDto, createdBy: string): Promise<LabTest> {
        const { lab_category_id } = labTestDto;
        const category = await this.labTestCategoryRepo.findOne(lab_category_id);

        return this.labTestRepository.saveLabTest(labTestDto, category, createdBy);
    }

    async updateLabTest(id: string, labTestDto: LabTestDto, updatedBy: string): Promise<any> {
        const { lab_category_id, hmo_id } = labTestDto;

        const hmo = await this.hmoSchemeRepository.findOne(hmo_id);
        const category = await this.labTestCategoryRepo.findOne(lab_category_id);
        const labTest = await this.labTestRepository.findOne(id);

        const service = await this.serviceCostRepository.findOne({ where: { code: labTest.code, hmo } });

        try {
            const query = await this.labTestRepository.updateLabTest(labTestDto, labTest, category, updatedBy);

            return { ...query, service };
        } catch (e) {
            throw new NotFoundException('could not update lab test');
        }
    }

    async deleteLabTest(id: number, username): Promise<LabTest> {
        const test = await this.labTestRepository.findOne(id);

        if (!test) {
            throw new NotFoundException(`Lab test with ID '${id}' not found`);
        }

        test.deletedBy = username;
        await test.save();

        return test.softRemove();
    }

    /*
        LAB TEST CATEGORIES
    */

    async getCategories(param): Promise<any[]> {
        const { hasTest, hmo_id } = param;

        const categories = await this.labTestCategoryRepo.find();

        if (hasTest !== '1') {
            return categories;
        }

        let results = [];
        const hmo = await this.hmoSchemeRepository.findOne(hmo_id);

        for (const category of categories) {
            const tests = await this.labTestRepository.find({
                where: { category, hmo },
                relations: ['category', 'hmo'],
                order: { name: 'ASC' },
            });
            results = [...results, { ...category, lab_tests: tests }];
        }
        return results;
    }

    async createCategory(labCategoryDto: LabCategoryDto, createdBy: string): Promise<LabTestCategory> {
        return this.labTestCategoryRepo.saveCategory(labCategoryDto, createdBy);
    }

    async updateCategory(id: number, labCategoryDto: LabCategoryDto, updatedBy: string): Promise<LabTestCategory> {
        const { name } = labCategoryDto;
        const category = await this.labTestCategoryRepo.findOne(id);
        if (name !== category.name) {
            category.name = name;
            category.lastChangedBy = updatedBy;
            await category.save();
        }
        return category;
    }

    async deleteCategory(id: number, username): Promise<LabTestCategory> {
        const category = await this.labTestCategoryRepo.findOne(id);

        if (!category) {
            throw new NotFoundException(`Lab test category with ID '${id}' not found`);
        }

        category.deletedBy = username;
        await category.save();

        return category.softRemove();
    }

    /*
        LAB TEST PARAMETERS
    */

    async getParameters(searchTerm): Promise<Parameter[]> {
        if (searchTerm && searchTerm.length > 0) {
            return await this.parameterRepository.find({
                where: { name: Like(`%${searchTerm}%`) },
                order: { name: 'ASC' },
            });
        }

        return this.parameterRepository.find();
    }

    async createParameter(parameterDto: ParameterDto): Promise<Parameter> {
        return this.parameterRepository.saveParameter(parameterDto);
    }

    async updateParameter(id: string, parameterDto: ParameterDto): Promise<Parameter> {
        const { name } = parameterDto;
        const parameter = await this.parameterRepository.findOne(id);
        parameter.name = name;
        await parameter.save();
        return parameter;
    }

    async deleteParameter(id: number, username): Promise<Parameter> {
        const parameter = await this.parameterRepository.findOne(id);

        if (!parameter) {
            throw new NotFoundException(`Lab parameter with ID '${id}' not found`);
        }

        parameter.deletedBy = username;
        await parameter.save();

        return parameter.softRemove();
    }

    /*
        LAB SPECIMEN
    */

    async getSpecimens(): Promise<Specimen[]> {
        return this.specimenRepository.find();
    }

    async createSpecimen(specimenDto: SpecimenDto, createdBy: string): Promise<Specimen> {
        return this.specimenRepository.saveSpecimen(specimenDto, createdBy);
    }

    async updateSpecimen(id: string, specimenDto: SpecimenDto, updatedBy: string): Promise<Specimen> {
        const { name } = specimenDto;
        const specimen = await this.specimenRepository.findOne(id);
        specimen.name = name;
        specimen.lastChangedBy = updatedBy;
        await specimen.save();
        return specimen;
    }

    async deleteSpecimen(id: number, username: string): Promise<Specimen> {
        const specimen = await this.specimenRepository.findOne(id);

        if (!specimen) {
            throw new NotFoundException(`Lab parameter with ID '${id}' not found`);
        }

        specimen.deletedBy = username;
        await specimen.save();

        return specimen.softRemove();
    }

    /*
        LAB GROUPS
    */

    async getGroups(): Promise<Group[]> {
        const hmo = await this.hmoSchemeRepository.findOne({ where: { name: 'Private' } });

        const query = await this.groupRepository.find({ relations: ['tests'] });

        let result = [];
        for (const item of query) {
            let allTests = [];
            for (const test of item.tests) {
                const serviceCost = await this.serviceCostRepository.findOne({
                    where: { code: test.labTest.code, hmo },
                });

                const labTest = { ...test.labTest, service: serviceCost };

                allTests = [...allTests, { ...test, labTest }];
            }

            result = [...result, { ...item, tests: allTests }];
        }

        return result;
    }

    async createGroup(groupDto: GroupDto, createdBy: string): Promise<any> {
        try {
            const group = await this.groupRepository.saveGroup(groupDto, createdBy);

            let tests = [];
            for (const item of groupDto.lab_tests) {
                const test = await this.labTestRepository.findOne(item.id);

                const groupTest = new GroupTest();
                groupTest.labTest = test;
                groupTest.group = group;
                const rs = await groupTest.save();

                tests = [...tests, rs];
            }

            return { ...group, tests };
        } catch (e) {
            console.log(e);
            throw new NotFoundException('could not create group');
        }
    }

    async updateGroup(id: number, groupDto: GroupDto, updatedBy: string): Promise<any> {
        const { name, lab_tests, description } = groupDto;

        const group = await this.groupRepository.findOne(id);
        group.name = name;
        group.slug = slugify(name);
        group.description = description;
        group.lastChangedBy = updatedBy;
        await group.save();

        await getConnection().createQueryBuilder().delete().from(GroupTest).where('group_id = :id', { id }).execute();

        let tests = [];
        for (const item of lab_tests) {
            const test = await this.labTestRepository.findOne(item.id);

            const groupTest = new GroupTest();
            groupTest.labTest = test;
            groupTest.group = group;
            const rs = await groupTest.save();

            tests = [...tests, rs];
        }

        return { ...group, tests };
    }

    async deleteGroup(id: number, username: string): Promise<Group> {
        const group = await this.groupRepository.findOne(id);

        if (!group) {
            throw new NotFoundException(`Lab parameter with ID '${id}' not found`);
        }

        group.deletedBy = username;
        await group.save();

        return group.softRemove();
    }
}
