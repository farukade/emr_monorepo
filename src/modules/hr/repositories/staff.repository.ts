import { EntityRepository, Repository } from 'typeorm';
import { StaffDetails } from '../entities/staff_details.entity';

@EntityRepository(StaffDetails)
export class StaffRepository extends Repository<StaffDetails> {}
