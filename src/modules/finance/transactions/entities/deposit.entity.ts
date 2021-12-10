import { Entity, ManyToOne, JoinColumn, Column, OneToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Patient } from '../../../patient/entities/patient.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';
import { Transaction } from '../transaction.entity';

@Entity({ name: 'account_deposits' })
export class AccountDeposit extends CustomBaseEntity {

	@ManyToOne(() => Patient, { nullable: true })
	@JoinColumn({ name: 'patient_id' })
	patient: Patient;

	@ManyToOne(type => StaffDetails, { nullable: true })
	@JoinColumn({ name: 'staff_id' })
	staff: StaffDetails;

	@Column({ type: 'float4', default: 0.0 })
	amount: number;

	@OneToOne(type => Transaction, { eager: true })
	@JoinColumn({ name: 'transaction_id' })
	transaction: Transaction;

}
