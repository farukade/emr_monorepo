import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { StaffDetails } from '../../staff/entities/staff_details.entity';
import { SalaryPaymentAllowance } from './salary_payment_allowance.entity';
import { SalaryDeductionAllowance } from './salary_payment_deductions.entity';

@Entity({ name: 'salary_payments' })
export class SalaryPayment extends CustomBaseEntity {

    @ManyToOne(type => StaffDetails)
    @JoinColumn({ name: 'staff_id' })
    staff: StaffDetails;

    @Column({ type: 'varchar', length: 20})
    payment_month: string;

    @Column({ type: 'int', nullable: true})
    total_allowance: number;

    @Column({ type: 'int', nullable: true})
    total_deduction: number;

    @Column({ type: 'int', nullable: true})
    amount_paid: number;

    @Column({ type: 'varchar', nullable: true})
    comment: number;

    @Column({ type: 'smallint', default: 0})
    status: number;

    @OneToMany(
        () => SalaryPaymentAllowance,
        allowances => allowances.payment,
        { eager: true, onDelete: 'CASCADE' },
    )
    allowances: SalaryPaymentAllowance[];

    @OneToMany(
        () => SalaryDeductionAllowance,
        deductions => deductions.payment,
        { eager: true, onDelete: 'CASCADE' },
    )
    deductions: SalaryDeductionAllowance[];
}
