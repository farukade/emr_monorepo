import { EntityRepository, Repository } from 'typeorm';
import { DepartmentDto } from './dto/department.dto';
import { Department } from '../entities/department.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';

@EntityRepository(Department)
export class DepartmentRepository extends Repository<Department> {

    async saveDepartment(departmentDto: DepartmentDto, staff: StaffDetails): Promise<Department> {
        const { name, description }  = departmentDto;
        const department  = new Department();
        department.name   = name;
        department.description   = description;
        if (staff) {
            department.staff = staff;
        }
        await department.save();
        return department;
    }
}
