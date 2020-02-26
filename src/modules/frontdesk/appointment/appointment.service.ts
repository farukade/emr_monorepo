import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentRepository } from './appointment.repository';
import { AppointmentDto } from './dto/appointment.dto';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { SpecializationRepository } from '../../settings/specialization/specialization.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { ConsultingRoomRepository } from '../../settings/consulting-room/consulting-room.repository';
import { Appointment } from './appointment.entity';

@Injectable()
export class AppointmentService {
    constructor(
        @InjectRepository(AppointmentRepository)
        private appointmentRepository: AppointmentRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(SpecializationRepository)
        private specializationRepository: SpecializationRepository,
        @InjectRepository(DepartmentRepository)
        private departmentRepository: DepartmentRepository,
        @InjectRepository(ConsultingRoomRepository)
        private consultingRoomRepository: ConsultingRoomRepository,
    ) {}

    async saveNewAppointment(appointmentDto: AppointmentDto): Promise<Appointment> {
        const { patient_id, department_id, specialization_id, consulting_room_id} = appointmentDto;
        // find patient details
        const patient = await this.patientRepository.findOne(patient_id);
        // find department details
        const department = await this.departmentRepository.findOne(department_id);
        // find specialization
        const specialization = await this.specializationRepository.findOne(specialization_id);
        // find consulting room
        const consultingRoom = await this.consultingRoomRepository.findOne(consulting_room_id);

        const result = await this.appointmentRepository.saveAppointment(appointmentDto, patient, specialization, department, consultingRoom);

        return result;

    }
}
