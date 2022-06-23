import { EntityRepository, Repository } from 'typeorm';
import { AttendanceDepartment } from '../entities/attendance-department.entity';

@EntityRepository(AttendanceDepartment)
export class AttendanceDepartmentRepository extends Repository<AttendanceDepartment> {}
