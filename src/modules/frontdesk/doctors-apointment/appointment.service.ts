import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StaffDetails } from 'src/modules/hr/staff/entities/staff_details.entity';
import { PatientRepository } from 'src/modules/patient/repositories/patient.repository';
import { DepartmentRepository } from 'src/modules/settings/departments/department.repository';
import { getRepository, Not, Raw } from 'typeorm';
import { DoctorsAppointmentRepository } from './appointment.repository';
import { DoctorsAppointmentDto } from './dto/appointment.dto';
import * as moment from 'moment';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { DoctorsAppointment } from './appointment.entity';

@Injectable()
export class DoctorsAppointmentService {
	constructor(
		@InjectRepository(DoctorsAppointmentRepository)
		private doctorsAppointmentRepository: DoctorsAppointmentRepository,
		@InjectRepository(PatientRepository)
		private patientRepository: PatientRepository,
		@InjectRepository(DepartmentRepository)
		private departmentRepository: DepartmentRepository,
		@InjectRepository(StaffRepository)
		private staffRepository: StaffRepository,
	) {}

	async getDoctorsAppointments(params: any): Promise<DoctorsAppointment[]> {
		const { staff_id } = params;

		const query = this.doctorsAppointmentRepository
			.createQueryBuilder('d')
			.select('d.*');

		if (staff_id && staff_id !== '') {
			query.where('d.doctor_id = :staff_id', { staff_id });
		}

		const result = await query.orderBy('d.createdAt', 'DESC').getRawMany();

		let appointments = [];

		for (const item of result) {
			const patient = await this.patientRepository.findOne({
				where: { id: item.patient_id },
				relations: ['hmo', 'immunization', 'nextOfKin'],
			});

			appointments = [...appointments, { ...item, patient }];
		}

		return appointments;
	}

	async createAppointment(data: DoctorsAppointmentDto, username: string) {
		try {
			const { department_id, doctor_id, patient_id } = data;

			// get patient file
			const patient = await this.patientRepository.findOne(patient_id);
			if (!patient) {
				return { success: false, message: 'please select a patient' };
			}

			// get doctor
			const doctor = await getRepository(StaffDetails).findOne(doctor_id);
			if (!doctor) {
				return { success: false, message: 'please select a doctor' };
			}

			// get doctor's department
			const department = await this.departmentRepository.findOne(department_id);

			const date = moment(data.appointment_date).format('YYYY-MM-DD');

			const appointmentDateTime = `${date} ${data.appointment_time}`;

			const appointment = new DoctorsAppointment();
			appointment.appointment_datetime = appointmentDateTime;
			appointment.appointment_date = date;
			appointment.appointment_time = data.appointment_time;
			appointment.patient = patient;
			appointment.doctor = doctor;
			appointment.department = department;
			appointment.is_online = data.isOnline;
			appointment.createdBy = username;

			const rs = await this.doctorsAppointmentRepository.save(appointment);

			return { success: false, appointment: rs };
		} catch (e) {
			return { success: false, message: e.message };
		}
	}

	async checkDate(param): Promise<any> {
		try {
			const { date, staff_id, duration, duration_type } = param;

			const doctor = await this.staffRepository.findOne({ id: staff_id });

			const start = moment(date, 'YYYY-MM-DD HH:mm:ss')
				.subtract(1, 'h')
				.format('YYYY-MM-DD HH:mm:ss');
			const end = moment(date, 'YYYY-MM-DD HH:mm:ss')
				.add(duration, duration_type)
				.format('YYYY-MM-DD HH:mm:ss');

			const rs = await this.doctorsAppointmentRepository.find({
				where: {
					doctor,
					appointment_date: Raw(alias => `${alias} BETWEEN :start AND :end`, {
						start,
						end,
					}),
				},
			});

			return { success: true, available: rs.length < 4 };
		} catch (e) {
			console.log(e);
			return { success: false, message: 'could not check date' };
		}
	}
}
