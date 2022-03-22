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
    ) {
    }

    async getDepartments(): Promise<Department[]> {
        const results = await this.departmentRepository.createQueryBuilder('q')
            .select('q.id, q.name, q.description, q.hod_id, q.has_appointment')
            .orderBy('q.createdAt')
            .getRawMany();

        for (const result of results) {
            if (result.hod_id) {
                const staff = await this.staffRepository.findOne(result.hod_id);
                result.hod_name = staff.first_name + ' ' + staff.last_name;
            }
        }
        return results;
    }

    async createDepartment(departmentDto: DepartmentDto, createdBy: string): Promise<Department> {
        const { hod_id } = departmentDto;
        let staff;
        if (hod_id) {
            staff = await this.staffRepository.findOne(hod_id);
        }
        return this.departmentRepository.saveDepartment(departmentDto, staff, createdBy);
    }

    async updateDepartment(id: string, departmentDto: DepartmentDto, updatedBy): Promise<any> {
        try {
            const { name, description, hod_id } = departmentDto;

            let staff;
            if (hod_id) {
                staff = await this.staffRepository.findOne(hod_id);

                const dept = await this.departmentRepository.findOne({
                    where: { staff },
                });

                if (dept && dept.id !== parseInt(id, 10) && dept.staff.id === parseInt(hod_id, 10)) {
                    return { success: false, message: 'you cannot use the same staff for multiple departments' };
                }
            }

            const department = await this.departmentRepository.findOne(id);

            department.name = name;
            department.description = description;
            department.lastChangedBy = updatedBy;
            if (staff) {
                department.staff = staff;
            }
            await department.save();
            return {
                success: true,
                department: { ...department, hod_name: (staff) ? `${staff.first_name} ${staff.last_name}` : '' },
            };
        } catch (e) {
            console.log(e);
            return { success: false, message: 'could not save department' };
        }
    }

    async deleteDepartment(id: number, username: string) {
        const department = await this.departmentRepository.findOne(id);

        if (!department) {
            throw new NotFoundException(`Department with ID '${id}' not found`);
        }

        department.deletedBy = username;
        await department.save();

        return department.softRemove();
    }
}
