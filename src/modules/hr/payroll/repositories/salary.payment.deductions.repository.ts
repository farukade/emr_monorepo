import { EntityRepository, Repository } from 'typeorm';
import { SalaryPaymentDeduction } from '../entities/salary_payment_deductions.entity';

@EntityRepository(SalaryPaymentDeduction)
export class SalaryPaymentDeductionRepository extends Repository<SalaryPaymentDeduction> {}
