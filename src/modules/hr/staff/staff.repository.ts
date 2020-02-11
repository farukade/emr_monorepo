import { EntityRepository, Repository } from 'typeorm';
import { StaffDetails } from './staff_details.entity';

@EntityRepository(StaffDetails)
export class StaffRepository extends Repository<StaffDetails> {}
