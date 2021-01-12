import { Injectable, NotFoundException, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DepartmentRepository } from './department.repository';
import { DepartmentDto } from './dto/department.dto';
import { Department } from '../entities/department.entity';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { User } from '../../hr/entities/user.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { Not, Equal } from 'typeorm';

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
            .leftJoin(User, 'creator', 'q.createdBy = creator.username')
            // .innerJoin(StaffDetails, 'hod', 'q.hod_id = hod.id')
            .innerJoin(StaffDetails, 'staff1', 'staff1.user_id = creator.id')
            // .innerJoin(StaffDetails, 'staff2', 'staff2.user_id = updator.id')
            .select('q.id, q.name, q.description, q.hod_id')
            .addSelect('CONCAT(staff1.first_name || \' \' || staff1.last_name) as created_by, staff1.id as created_by_id')
            // .addSelect('CONCAT(hod.first_name || \' \' || hod.last_name) as hod_name, hod.id as hod_staff_id')
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

    async updateDepartment(id: string, departmentDto: DepartmentDto, updatedBy): Promise<Department> {
        try {
            const { name, description, hod_id } = departmentDto;

            let staff;
            if (hod_id) {
                staff = await this.staffRepository.findOne(hod_id);

                const dept = await this.departmentRepository.findOne({
                    where: { staff, id: Not(Equal(hod_id)) },
                });

                if (dept && dept.staff && staff && dept.staff.id === staff.id) {
                    console.log('error here');
                    throw new HttpException('you cannot use the same staff for multiple departments', 500);
                    return;
                }
            }

            const department = await this.departmentRepository.findOne(id);

            console.log('continue');
            department.name = name;
            department.description = description;
            department.lastChangedBy = updatedBy;
            if (staff) {
                department.staff = staff;
            }
            await department.save();
            return department;
        } catch (e) {
            console.log(e);
            throw new NotFoundException('error, ');
        }
    }

    async deleteDepartment(id: string): Promise<void> {
        const result = await this.departmentRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Department with ID '${id}' not found`);
        }
    }
}
