import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SalaryPaymentAllowance } from './salary_payment_allowance.entity';
import { SalaryPaymentDeduction } from './salary_payment_deductions.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';
import { Department } from '../../../settings/entities/department.entity';

@Entity({ name: 'salary_payments' })
export class SalaryPayment extends CustomBaseEntity {
	@ManyToOne(() => StaffDetails)
	@JoinColumn({ name: 'staff_id' })
	staff: StaffDetails;

	@Column({ type: 'varchar' })
	staff_name: string;

	@ManyToOne(() => Department, { nullable: true })
	@JoinColumn({ name: 'department_id' })
	department: Department;

	@Column({ type: 'varchar', length: 20 })
	payment_month: string;

	@Column({ type: 'float4', nullable: true })
	total_allowance: number;

	@Column({ type: 'float4', nullable: true })
	total_deduction: number;

	@Column({ type: 'float4', nullable: true })
	amount_paid: number;

	@Column({ type: 'varchar', nullable: true })
	comment: string;

	@Column({ type: 'smallint', default: 0 })
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
