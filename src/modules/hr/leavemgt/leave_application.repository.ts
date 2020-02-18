import { EntityRepository, Repository } from 'typeorm';
import { LeaveApplication } from './entities/leave_application.entity';

@EntityRepository(LeaveApplication)
export class LeaveApplicationRepository extends Repository<LeaveApplication> {
    
}
