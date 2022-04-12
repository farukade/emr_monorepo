import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { StaffDetails } from 'src/modules/hr/staff/entities/staff_details.entity';
import { Patient } from 'src/modules/patient/entities/patient.entity';
import { Department } from 'src/modules/settings/entities/department.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'doctor_appointments' })
export class DoctorsAppointment extends CustomBaseEntity {
	@Column()
	appointment_datetime: string;

	@Column()
	appointment_time: string;

	@Column()
	appointment_date: string;

	@ManyToOne(type => Department, { nullable: true })
	@JoinColumn({ name: 'department_id' })
	department: Department;

	@ManyToOne(type => Patient)
	@JoinColumn({ name: 'patient_id' })
	patient: Patient;

	@ManyToOne(type => StaffDetails)
	@JoinColumn({ name: 'doctor_id' })
	doctor: StaffDetails;

	@Column({ type: 'boolean', default: false })
	is_online: boolean;

	@Column({ type: 'boolean', default: false, nullable: true })
	is_booked: boolean;
}
