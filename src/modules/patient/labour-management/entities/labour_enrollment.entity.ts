import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { AntenatalEnrollment } from '../../antenatal/entities/antenatal-enrollment.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';

@Entity({ name: 'labour_enrollments' })
export class LabourEnrollment extends CustomBaseEntity {
	@Column()
	serial_code: string;

	@ManyToOne(() => Patient)
	@JoinColumn({ name: 'patient_id' })
	patient: Patient;

	@ManyToOne(() => AntenatalEnrollment, { nullable: true })
	@JoinColumn({ name: 'antenatal_id' })
	antenatal: AntenatalEnrollment;

	@Column('simple-json')
	father: { name: string, phone: string, blood_group: string };

	@Column({ nullable: true })
	alive: string;

	@Column({ nullable: true })
	miscarriage: string;

	@Column({ nullable: true })
	present_pregnancies: string;

	@Column({ nullable: true })
	lmp: string;

	@Column({ nullable: true })
	date_closed: string;

	@ManyToOne(() => StaffDetails, { nullable: true })
	@JoinColumn({ name: 'closed_by' })
	closedBy: StaffDetails;

	@Column({ type: 'smallint', default: 0 })
	status: number;
}
