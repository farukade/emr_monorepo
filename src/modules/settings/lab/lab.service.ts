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

@Injectable()
export class LabService {
    constructor(
        @InjectRepository(LabTestCategoryRepository)
        private labTestCategoryRepo: LabTestCategoryRepository,
        @InjectRepository(LabTestRepository)
        private labTestRepository: LabTestRepository,
        @InjectRepository(ParameterRepository)
        private parameterRepository: ParameterRepository,
    ) {}

    /*
        LAB TESTS
    */

    async getTests(): Promise<LabTest[]> {
        return this.labTestRepository.find({relations:['category']});
    }

    async createLabTest(labTestDto: LabTestDto): Promise<LabTest> {
        const { lab_category_id } = labTestDto;
        const category = await this.labTestCategoryRepo.findOne(lab_category_id);

        return this.labTestRepository.saveLabTest(labTestDto, category);
    }

    async updateLabTest(id: string, labTestDto: LabTestDto): Promise<LabTest> {
        const { lab_category_id } = labTestDto;
        const category = await this.labTestCategoryRepo.findOne(lab_category_id);
        const labTest = await this.labTestRepository.findOne(id);

        return this.labTestRepository.updateLabTest(labTestDto, labTest, category);
    }

    async deleteLabTest(id: string): Promise<void> {
        const result = await this.labTestRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Lab test with ID '${id}' not found`);
        }
    }
    /*
        LAB TEST CATEGORIES
    */

    async getCategories(): Promise<LabTestCategory[]> {
        return this.labTestCategoryRepo.find();
    }

    async createCategory(labCategoryDto: LabCategoryDto): Promise<LabTestCategory> {
        return this.labTestCategoryRepo.saveCategory(labCategoryDto);
    }

    async updateCategory(id: string, labCategoryDto: LabCategoryDto): Promise<LabTestCategory> {
        const { name } = labCategoryDto;
        const category = await this.labTestCategoryRepo.findOne(id);
        category.name = name;
        await category.save();
        return category;
    }

    async deleteCategory(id: string): Promise<void> {
        const result = await this.labTestCategoryRepo.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Lab test category with ID '${id}' not found`);
        }
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
}
