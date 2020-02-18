import { EntityRepository, Repository } from 'typeorm';
import { SalaryPaymentAllowance } from '../entities/salary_payment_allowance.entity';

@EntityRepository(SalaryPaymentAllowance)
export class SalaryPaymentAllowanceRepository extends Repository<SalaryPaymentAllowance> {}
