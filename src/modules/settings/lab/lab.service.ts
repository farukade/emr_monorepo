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
import { Like } from 'typeorm';

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
    ) {}

    /*
        LAB TESTS
    */

    async getTests(options: PaginationOptionsInterface, searchTerm: string): Promise<Pagination> {
        if (searchTerm && searchTerm.length > 0) {
            const rs = await this.labTestRepository.find({ relations: ['category'], where: [
                    { name: Like(`%${searchTerm}%`) },
                ] });

            return { currentPage: 0, itemsPerPage: 0, lastPage: 0, totalPages: 0, result: rs};
        }

        const page = options.page - 1;

        const result = await this.labTestRepository.find({
            relations: ['category'],
            order: {name: 'ASC'},
            take: options.limit,
            skip: (page * options.limit),
        });

        const count = await this.labTestRepository.count();

        return {
            result,
            lastPage: Math.ceil(count / options.limit),
            itemsPerPage: options.limit,
            totalPages: count,
            currentPage: options.page,
        };
    }

    async createLabTest(labTestDto: LabTestDto, createdBy: string): Promise<LabTest> {
        const { lab_category_id } = labTestDto;
        const category = await this.labTestCategoryRepo.findOne(lab_category_id);

        return this.labTestRepository.saveLabTest(labTestDto, category, createdBy);
    }

    async updateLabTest(id: string, labTestDto: LabTestDto, updatedBy: string): Promise<LabTest> {
        const { lab_category_id } = labTestDto;
        const category = await this.labTestCategoryRepo.findOne(lab_category_id);
        const labTest = await this.labTestRepository.findOne(id);

        return this.labTestRepository.updateLabTest(labTestDto, labTest, category, updatedBy);
    }

    async deleteLabTest(id: string): Promise<LabTest> {
        // // delete previous parameters
        // await getConnection()
        //     .createQueryBuilder()
        //     .delete()
        //     .from(LabTestParameter)
        //     .where('lab_test_parameters.lab_test_id = :id', {id})
        //     .execute();

        const result = await this.labTestRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Lab test with ID '${id}' not found`);
        }

        const test = new LabTest();
        test.id = id;
        return test;
    }
    /*
        LAB TEST CATEGORIES
    */

    async getCategories(hasTest: boolean): Promise<any[]> {
        const categories = await this.labTestCategoryRepo.find();

        if (!hasTest) {
            return categories;
        }

        let results = [];
        for (const category of categories) {
            const tests = await this.labTestRepository.find({
                where: { category },
                order: {name: 'ASC'},
            });

            results = [...results, {...category, lab_tests: tests}];
        }

        return results;
    }

    async createCategory(labCategoryDto: LabCategoryDto, createdBy: string): Promise<LabTestCategory> {
        return this.labTestCategoryRepo.saveCategory(labCategoryDto, createdBy);
    }

    async updateCategory(id: string, labCategoryDto: LabCategoryDto, updatedBy: string): Promise<LabTestCategory> {
        const { name } = labCategoryDto;
        const category = await this.labTestCategoryRepo.findOne(id);
        category.name = name;
        category.lastChangedBy = updatedBy;
        await category.save();
        return category;
    }

    async deleteCategory(id: string): Promise<LabTestCategory> {
        const result = await this.labTestCategoryRepo.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Lab test category with ID '${id}' not found`);
        }

        const category = new LabTestCategory();
        category.id = id;
        return category;
    }

    /*
        LAB TEST PARAMETERS
    */

    async getParameters(): Promise<Parameter[]> {
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

    async deleteParameter(id: string): Promise<void> {
        const result = await this.parameterRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Lab parameter with ID '${id}' not found`);
        }
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

    async deleteSpecimen(id: string): Promise<Specimen> {
        const result = await this.specimenRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Lab parameter with ID '${id}' not found`);
        }

        const specimen = new Specimen();
        specimen.id = id;
        return specimen;
    }

    /*
        LAB GROUPS
    */

    async getGroups(): Promise<Group[]> {
        return this.groupRepository.find();
    }

    async createGroup(groupDto: GroupDto, createdBy: string): Promise<Group> {
        return this.groupRepository.saveGroup(groupDto, createdBy);
    }

    async updateGroup(id: string, groupDto: GroupDto, updatedBy: string): Promise<Group> {
        const { name, lab_tests, price, description } = groupDto;
        const group = await this.groupRepository.findOne(id);
        group.name = name;
        group.slug = slugify(name);
        group.lab_tests = lab_tests;
        group.price = price;
        group.description = description;
        group.lastChangedBy = updatedBy;
        await group.save();
        return group;
    }

    async deleteGroup(id: string): Promise<Group> {
        const result = await this.groupRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Lab parameter with ID '${id}' not found`);
        }

        const group = new Group();
        group.id = id;
        return group;
    }
}
