import { EntityRepository, Repository } from 'typeorm';
import { DepartmentDto } from './dto/department.dto';
import { Department } from '../entities/department.entity';

@EntityRepository(Department)
export class DepartmentRepository extends Repository<Department> {

    async saveDepartment(departmentDto: DepartmentDto): Promise<Department> {
        const { name, description }  = departmentDto;
        const department  = new Department();
        department.name   = name;
        department.description   = description;
        await department.save();
        return department;
    }
}
