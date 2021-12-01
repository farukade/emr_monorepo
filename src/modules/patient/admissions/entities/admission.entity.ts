import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, Column, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { Room } from '../../../settings/entities/room.entity';
import { AdmissionClinicalTask } from './admission-clinical-task.entity';
import { Nicu } from '../../nicu/entities/nicu.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';

@Entity({ name: 'admissions' })
export class Admission extends CustomBaseEntity {
	@ManyToOne(() => Patient)
	@JoinColumn({ name: 'patient_id' })
	patient: Patient;

	@Column({ nullable: true })
	health_state: string;

	@Column({ default: false })
	risk_to_fall: boolean;

	@ManyToOne(() => Room, { nullable: true })
	@JoinColumn({ name: 'room_id' })
	room: Room;

	@Column({ nullable: true })
	room_assigned_at: string;

	@Column({ type: 'varchar', nullable: true })
	room_assigned_by: string;

	@Column({ type: 'text', nullable: true })
	reason: string;

	@OneToMany(() => AdmissionClinicalTask, tasks => tasks.admission)
	tasks: AdmissionClinicalTask;

	@OneToOne(() => Nicu, item => item.admission)
	@JoinColumn({ name: 'nicu_id' })
	nicu: Nicu;

	@Column({ type: 'smallint', default: 0 })
	status: number;

	@Column({ default: false })
	start_discharge: boolean;

	@Column({ nullable: true })
	start_discharge_date: string;

	@Column({ type: 'varchar', nullable: true })
	start_discharge_by: string;

	@Column({ nullable: true })
	date_discharged: string;

	@ManyToOne(() => StaffDetails, { nullable: true })
	@JoinColumn({ name: 'discharged_by' })
	dischargedBy: StaffDetails;

	@Column({ type: 'text', nullable: true })
	discharge_note: string;
}
