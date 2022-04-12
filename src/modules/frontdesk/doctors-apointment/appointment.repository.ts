import moment = require('moment');
import { StaffDetails } from 'src/modules/hr/staff/entities/staff_details.entity';
import { Patient } from 'src/modules/patient/entities/patient.entity';
import { Department } from 'src/modules/settings/entities/department.entity';
import { EntityRepository, Repository } from 'typeorm';
import { DoctorsAppointment } from './appointment.entity';
import { DoctorsAppointmentDto } from './dto/appointment.dto';

@EntityRepository(DoctorsAppointment)
export class DoctorsAppointmentRepository extends Repository<
	DoctorsAppointment
> {
	async saveAppointment(
		data: DoctorsAppointmentDto,
		patient: Patient,
		doctor: StaffDetails,
		department: Department,
		username: string,
	) {
		const date = moment(data.appointment_date).format('YYYY-MM-DD');

		const appointmentDateTime = `${date} ${data.appointment_time}`;

		const proposedAppointment = new DoctorsAppointment();
		proposedAppointment.appointment_datetime = appointmentDateTime;
		proposedAppointment.appointment_date = date;
		proposedAppointment.appointment_time = data.appointment_time;
		proposedAppointment.patient = patient;
		proposedAppointment.doctor = doctor;
		proposedAppointment.department = department;
		proposedAppointment.is_online = data.isOnline;
		proposedAppointment.createdBy = username;

		await proposedAppointment.save();

		return proposedAppointment;
	}
}
