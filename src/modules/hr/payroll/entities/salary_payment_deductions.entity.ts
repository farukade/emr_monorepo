import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { SalaryPayment } from './salary_payment.entity';

@Entity({ name: 'salary_payment_deductions' })
export class SalaryDeductionAllowance extends CustomBaseEntity {

    @ManyToOne(
        type => SalaryPayment,
        payment => payment.deductions,
    )
    @JoinColumn({ name: 'salary_payment_id' })
    payment!: SalaryPayment;

    @Column({ type: 'varchar', length: 50})
    label: string;

    @Column({ type: 'varchar', length: 20})
    value: number;
}
