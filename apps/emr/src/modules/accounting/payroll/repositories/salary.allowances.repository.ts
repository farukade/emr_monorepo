import { EntityRepository, Repository } from 'typeorm';
import { SalaryAllowance } from '../entities/salary_allowance.entity';

@EntityRepository(SalaryAllowance)
export class SalaryAllowanceRepository extends Repository<SalaryAllowance> {}
