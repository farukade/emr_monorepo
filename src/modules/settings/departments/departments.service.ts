import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DepartmentRepository } from './department.repository';
import { DepartmentDto } from './dto/department.dto';
import { Department } from '../entities/department.entity';

@Injectable()
export class DepartmentsService {
    constructor(
        @InjectRepository(DepartmentRepository)
        private departmentRepository: DepartmentRepository,
    ) {}
    async getDepartments(): Promise<Department[]> {
        return this.departmentRepository.find();
    }

    async createDepartment(departmentDto: DepartmentDto): Promise<Department> {
        return this.departmentRepository.saveDepartment(departmentDto);
    }

    async updateDepartment(id: string, departmentDto: DepartmentDto): Promise<Department> {
        const { name, description } = departmentDto;
        const department = await this.departmentRepository.findOne(id);
        department.name = name;
        department.description = description;
        await department.save();
        return department;
    }

    async deleteDepartment(id: string): Promise<void> {
        const result = await this.departmentRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Department with ID '${id}' not found`);
        }
    }
}
