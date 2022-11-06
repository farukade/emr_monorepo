import { EntityRepository, Repository } from 'typeorm';
import { Leave } from '../entities/leave.entity';

@EntityRepository(Leave)
export class LeaveRepository extends Repository<Leave> {}
