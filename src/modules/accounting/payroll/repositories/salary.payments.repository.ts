import { EntityRepository, Repository } from 'typeorm';
import { SalaryPayment } from '../entities/salary_payment.entity';

@EntityRepository(SalaryPayment)
export class SalaryPaymentRepository extends Repository<SalaryPayment> {}
