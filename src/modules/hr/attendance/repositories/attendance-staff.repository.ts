import { EntityRepository, Repository } from 'typeorm';
import { AttendanceStaff } from '../entities/attendance-staff.entity';

@EntityRepository(AttendanceStaff)
export class AttendanceStaffRepository extends Repository<AttendanceStaff> {}
