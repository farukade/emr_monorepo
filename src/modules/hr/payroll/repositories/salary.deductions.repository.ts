import { EntityRepository, Repository } from 'typeorm';
import { SalaryDeduction } from '../entities/salary_deduction.entity';

@EntityRepository(SalaryDeduction)
export class SalaryDeductionRepository extends Repository<SalaryDeduction> {}
