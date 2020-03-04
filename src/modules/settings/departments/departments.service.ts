import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DepartmentRepository } from './department.repository';
import { DepartmentDto } from './dto/department.dto';
import { Department } from '../entities/department.entity';
import { StaffRepository } from '../../hr/staff/staff.repository';

@Injectable()
export class DepartmentsService {
    constructor(
        @InjectRepository(DepartmentRepository)
        private departmentRepository: DepartmentRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
    ) {}
    async getDepartments(): Promise<Department[]> {
        return this.departmentRepository.find();
    }

    async createDepartment(departmentDto: DepartmentDto): Promise<Department> {
        const { hod_id } = departmentDto;
        let staff;
        if (hod_id) {
            staff = await this.staffRepository.findOne(hod_id);
        }
        return this.departmentRepository.saveDepartment(departmentDto, staff);
    }

    async updateDepartment(id: string, departmentDto: DepartmentDto): Promise<Department> {
        const { name, description, hod_id } = departmentDto;
        let staff;
        if (hod_id) {
            staff = await this.staffRepository.findOne(hod_id);
        }
        const department = await this.departmentRepository.findOne(id);
        department.name = name;
        department.description = description;
        if (staff) {
            department.staff = staff;
        }
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
