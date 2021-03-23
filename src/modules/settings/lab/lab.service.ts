import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LabTestCategoryRepository } from './lab.category.repository';
import { LabTestRepository } from './lab.test.repository';
import { LabTest } from '../entities/lab_test.entity';
import { ParameterRepository } from './parameter.repository';
import { LabTestCategory } from '../entities/lab_test_category.entity';
import { LabCategoryDto } from './dto/lab.category.dto';
import { Parameter } from '../entities/parameters.entity';
import { ParameterDto } from './dto/parameter.dto';
import { LabTestDto } from './dto/lab_test.dto';
import { Specimen } from '../entities/specimen.entity';
import { SpecimenDto } from './dto/specimen.dto';
import { SpecimenRepository } from './specimen.repository';
import { GroupRepository } from './group.repository';
import { Group } from '../entities/group.entity';
import { GroupDto } from './dto/group.dto';
import { slugify } from '../../../common/utils/utils';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { getConnection, Like, Raw } from 'typeorm';
import { HmoRepository } from '../../hmo/hmo.repository';
import { GroupTest } from '../entities/group_tests.entity';
import { GroupTestRepository } from './group_tests.repository';

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
        @InjectRepository(HmoRepository)
        private hmoRepository: HmoRepository,
        @InjectRepository(HmoRepository)
        private groupTestRepository: GroupTestRepository,
    ) {
    }

    /*
        LAB TESTS
    */

    async getTests(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { q, hmo_id } = params;

        const page = options.page - 1;

        const hmo = await this.hmoRepository.findOne(hmo_id);

        let result;
        let total = 0;
        if (q && q.length > 0) {
            [result, total] = await this.labTestRepository.findAndCount({
                where: { name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`), hmo },
                relations: ['category', 'hmo'],
                order: { name: 'ASC' },
                take: options.limit,
                skip: (page * options.limit),
            });
        } else {
            [result, total] = await this.labTestRepository.findAndCount({
                where: { hmo },
                relations: ['category', 'hmo'],
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


    async getTestsUnpaginated(params): Promise<any> {
        const { q, hmo_id } = params;
        const hmo = await this.hmoRepository.findOne(hmo_id);

        let result;
        if (q && q.length > 0) {
            result = await this.labTestRepository.find({
                where: { name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`), hmo },
                relations: ['category', 'hmo'],
                order: { name: 'ASC' },
            });
        } else {
            result = await this.labTestRepository.find({
                where: { hmo },
                relations: ['category', 'hmo'],
                order: { name: 'ASC' },
            });
        }

        return {success: true, result};
    }

    async createLabTest(labTestDto: LabTestDto, createdBy: string): Promise<LabTest> {
        const { lab_category_id, hmo_id } = labTestDto;
        const category = await this.labTestCategoryRepo.findOne(lab_category_id);
        const hmo = await this.hmoRepository.findOne(hmo_id);

        return this.labTestRepository.saveLabTest(labTestDto, category, createdBy, hmo);
    }

    async updateLabTest(id: string, labTestDto: LabTestDto, updatedBy: string): Promise<LabTest> {
        const { lab_category_id, hmo_id } = labTestDto;
        const category = await this.labTestCategoryRepo.findOne(lab_category_id);
        const labTest = await this.labTestRepository.findOne({ where: { id }, relations: ['hmo'] });
        const hmo = await this.hmoRepository.findOne(hmo_id);

        try {
            return this.labTestRepository.updateLabTest(labTestDto, labTest, category, updatedBy, hmo);
        } catch (e) {
            throw new NotFoundException('could not update lab test');
        }
    }

    async deleteLabTest(id: number, username): Promise<LabTest> {
        const test = await this.labTestRepository.findOne(id, { relations: ['hmo'] });

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
        const hmo = await this.hmoRepository.findOne(hmo_id);

        for (const category of categories) {
            const tests = await this.labTestRepository.find({
                where: { category, hmo },
                relations: ['category', 'hmo'],
                order: { name: 'ASC' },
            });
            console.log("lab_tests");
            console.log(tests);
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

    async getGroups(param): Promise<any[]> {
        const { hmo_id } = param;

        let result = [];

        if (hmo_id && hmo_id !== '') {
            const hmo = await this.hmoRepository.findOne(hmo_id);
            result = await this.groupRepository.find({ where: { hmo }, relations: ['hmo', 'tests'] });
        } else {
            result = await this.groupRepository.find({ relations: ['hmo', 'tests'] });
        }

        return result;
    }

    async createGroup(groupDto: GroupDto, createdBy: string): Promise<any> {
        try {
            const hmo = await this.hmoRepository.findOne(groupDto.hmo_id);

            const group = await this.groupRepository.saveGroup(groupDto, createdBy, hmo);

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
            throw new NotFoundException('could not group');
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
