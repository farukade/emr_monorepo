import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StaffDetails } from "src/modules/hr/staff/entities/staff_details.entity";
import { StaffRepository } from "src/modules/hr/staff/staff.repository";
import { PatientRepository } from "src/modules/patient/repositories/patient.repository";
import { DepartmentRepository } from "src/modules/settings/departments/department.repository";
import { getRepository } from "typeorm";
import { doctorsAppointmentDto } from "./dto/appointment.dto";
import { DoctorsAppointmentRepository } from "./appointment.repository";
import { DoctorsAppointment } from "./appointment.entity";

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

    async createDoctorsAppointment(data: doctorsAppointmentDto) {
        const {
            department_id,
            doctor_id,
            patient_id,
        } = data;

        // get patient file
        const patient = await this.patientRepository.findOne(patient_id);
        if (!patient) {
            return { success: false, message: 'please select a patient' };
        }
        
        // get doctor
        let doctor = null;
			if (doctor_id) {
				doctor = await getRepository(StaffDetails).findOne(doctor_id);
			}

        // get doctor's department
			const department = await this.departmentRepository.findOne(department_id);

            const doctorsAppointment = await this.doctorsAppointmentRepository.saveProposedAppointment(data, patient, doctor, department);

            return doctorsAppointment;
    }

    async getDoctorsAppointments() {
        try {
            return await this.doctorsAppointmentRepository.find({
                where: {
                    isBooked: false
                }
            });
        } catch (error) {
            console.log(error);
            return { success: false, message: "could no fetch resource" }
        }
    }

}