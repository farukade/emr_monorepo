import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StaffDetails } from 'src/modules/hr/staff/entities/staff_details.entity';
import { PatientRepository } from 'src/modules/patient/repositories/patient.repository';
import { DepartmentRepository } from 'src/modules/settings/departments/department.repository';
import { getRepository } from 'typeorm';
import { DoctorsAppointmentRepository } from './appointment.repository';
import { DoctorsAppointmentDto } from './dto/appointment.dto';

@Injectable()
export class DoctorsAppointmentService {
	constructor(
		@InjectRepository(DoctorsAppointmentRepository)
		private doctorsAppointmentRepository: DoctorsAppointmentRepository,
		@InjectRepository(PatientRepository)
		private patientRepository: PatientRepository,
		@InjectRepository(DepartmentRepository)
		private departmentRepository: DepartmentRepository,
	) {}

	async getDoctorsAppointments() {
		try {
			return await this.doctorsAppointmentRepository.find({
				where: {
					isBooked: false,
				},
			});
		} catch (error) {
			console.log(error);
			return { success: false, message: 'could no fetch resource' };
		}
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

			const doctorsAppointment = await this.doctorsAppointmentRepository.saveAppointment(
				data,
				patient,
				doctor,
				department,
				username,
			);

			return { success: false, appointment: doctorsAppointment };
		} catch (e) {
			return { success: false, message: e.message };
		}
	}
}
