import { EntityRepository, Repository } from 'typeorm';
import { DepartmentDto } from './dto/department.dto';
import { Department } from '../entities/department.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';

@EntityRepository(Department)
export class DepartmentRepository extends Repository<Department> {

    async saveDepartment(departmentDto: DepartmentDto, staff: StaffDetails, createdBy: string): Promise<any> {
        const { name, description }  = departmentDto;
        const department  = new Department();
        department.name         =  name;
        department.description  = description;
        department.createdBy    = createdBy;
        if (staff) {
            department.staff = staff;
        }
        await department.save();
        const data = {
            id: department.id,
            name: department.name,
            description: department.description,
            hod_id: (staff) ? staff.id : '',
            hod_name: (staff) ? staff.first_name + ' ' + staff.last_name : '',
        };
        return data;
    }
}
