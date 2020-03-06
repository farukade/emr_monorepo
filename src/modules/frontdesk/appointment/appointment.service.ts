import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentRepository } from './appointment.repository';
import { AppointmentDto } from './dto/appointment.dto';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { SpecializationRepository } from '../../settings/specialization/specialization.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { ConsultingRoomRepository } from '../../settings/consulting-room/consulting-room.repository';
import { Appointment } from './appointment.entity';
import * as moment from 'moment';
import { QueueSystemRepository } from '../queue-system/queue-system.repository';

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
        @InjectRepository(QueueSystemRepository)
        private queueSystemRepository: QueueSystemRepository,
    ) {}

    async todaysAppointments(): Promise<Appointment[]> {
        const today = moment().format('YYYY-MM-DD');
        const results = await this.appointmentRepository.find({
            where: {appointment_date: today},
            relations: ['department', 'patient', 'specialization', 'consultingRoom'],
        });

        return results;
    }

    async saveNewAppointment(appointmentDto: AppointmentDto): Promise<any> {
        try {
            const { patient_id, department_id, specialization_id, consulting_room_id, sendToQueue} = appointmentDto;
            // find patient details
            const patient = await this.patientRepository.findOne(patient_id);
            // find department details
            const department = await this.departmentRepository.findOne(department_id);
            // find specialization
            const specialization = await this.specializationRepository.findOne(specialization_id);
            // find consulting room
            const consultingRoom = await this.consultingRoomRepository.findOne(consulting_room_id);

            const appointment = await this.appointmentRepository.saveAppointment(appointmentDto, patient, specialization, department, consultingRoom);

            let queue;

            if (sendToQueue) {
                let queueNumber;
                const lastQueueRes = await this.queueSystemRepository.find({take: 1, order: {createdAt: 'DESC'}});
                if (lastQueueRes.length) {
                    // check if last queue date is today
                    const lastQueue = lastQueueRes[0];
                    const today = moment();
                    const isSameDay = today.isSame(lastQueue.createdAt, 'd');
                    if (isSameDay) {
                        queueNumber = lastQueue.queueNumber + 1;
                    } else {
                        queueNumber = 1;
                    }
                } else {
                    queueNumber = 1;
                }
                // add appointment to queue
                queue = await this.queueSystemRepository.saveQueue(appointment, queueNumber);
                // update appointment status
                appointment.status = 'In Queue';
                await appointment.save();
            }

            return { success: true, appointment, queue };
        } catch (error) {
            return { success: false, message: error.message };
        }

    }
}
