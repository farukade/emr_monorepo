import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SalaryPaymentAllowance } from './salary_payment_allowance.entity';
import { SalaryPaymentDeduction } from './salary_payment_deductions.entity';

@Entity({ name: 'salary_payments' })
export class SalaryPayment extends CustomBaseEntity {

    @Column({ type: 'varchar' })
    emp_code: string;

    @Column({ type: 'varchar' })
    staff_name: string;

    @Column({ type: 'varchar' })
    department: string;

    @Column({ type: 'varchar', length: 20})
    payment_month: string;

    @Column({ type: 'int', nullable: true})
    total_allowance: number;

    @Column({ type: 'int', nullable: true})
    total_deduction: number;

    @Column({ type: 'int', nullable: true})
    amount_paid: number;

    @Column({ type: 'varchar', nullable: true})
    comment: string;

    @Column({ type: 'smallint', default: 0})
    status: number;

    @OneToMany(
        () => SalaryPaymentAllowance,
        allowances => allowances.payment,
        { eager: true, onDelete: 'CASCADE' },
    )
    allowances: SalaryPaymentAllowance[];

    @OneToMany(
        () => SalaryPaymentDeduction,
        deductions => deductions.payment,
        { eager: true, onDelete: 'CASCADE' },
    )
    deductions: SalaryPaymentDeduction[];
}
