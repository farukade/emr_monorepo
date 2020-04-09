import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DepartmentRepository } from './department.repository';
import { DepartmentDto } from './dto/department.dto';
import { Department } from '../entities/department.entity';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { User } from '../../hr/entities/user.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';

@Injectable()
export class DepartmentsService {
    constructor(
        @InjectRepository(DepartmentRepository)
        private departmentRepository: DepartmentRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
    ) {}
    async getDepartments(): Promise<Department[]> {
        return await this.departmentRepository.createQueryBuilder('q')
                    .leftJoin(User, 'creator', 'q.createdBy = creator.username')
                    // .innerJoin(User, 'updator', 'q.lastChangedBy = updator.username')
                    .innerJoin(StaffDetails, 'staff1', 'staff1.user_id = creator.id')
                    // .innerJoin(StaffDetails, 'staff2', 'staff2.user_id = updator.id')
                    .select('q.id, q.name, q.description')
                    .addSelect('CONCAT(staff1.first_name || \' \' || staff1.last_name) as created_by, staff1.id as created_by_id')
                    // .addSelect('CONCAT(staff2.first_name || \' \' || staff2.last_name) as updated_by, staff2.id as updated_by_id')
                    .getRawMany();
    }

    async createDepartment(departmentDto: DepartmentDto, createdBy: string): Promise<Department> {
        const { hod_id } = departmentDto;
        let staff;
        if (hod_id) {
            staff = await this.staffRepository.findOne(hod_id);
        }
        return this.departmentRepository.saveDepartment(departmentDto, staff, createdBy);
    }

    async updateDepartment(id: string, departmentDto: DepartmentDto, updatedBy): Promise<Department> {
        const { name, description, hod_id } = departmentDto;
        let staff;
        if (hod_id) {
            staff = await this.staffRepository.findOne(hod_id);
        }
        const department = await this.departmentRepository.findOne(id);
        department.name = name;
        department.description = description;
        department.lastChangedBy = updatedBy;
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
