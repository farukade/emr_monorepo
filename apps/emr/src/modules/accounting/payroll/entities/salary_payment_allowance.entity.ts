import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { SalaryPayment } from './salary_payment.entity';

@Entity({ name: 'salary_payment_allowances' })
export class SalaryPaymentAllowance extends CustomBaseEntity {
  @ManyToOne(() => SalaryPayment, (payment) => payment.allowances)
  @JoinColumn({ name: 'salary_payment_id' })
  payment!: SalaryPayment;

  @Column({ type: 'varchar', length: 50 })
  label: string;

  @Column({ type: 'varchar', length: 20 })
  value: number;
}
