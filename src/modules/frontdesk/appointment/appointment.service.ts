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
import { Service } from '../../settings/entities/service.entity';
import { ServiceRepository } from '../../settings/services/service.repository';

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
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
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
            const { patient_id, department_id, specialization_id, consulting_room_id, sendToQueue, serviceType} = appointmentDto;
            // find patient details
            const patient = await this.patientRepository.findOne(patient_id);
            // find department details
            const department = await this.departmentRepository.findOne(department_id);
            // find specialization
            const specialization = await this.specializationRepository.findOne(specialization_id);
            // find consulting room
            const consultingRoom = await this.consultingRoomRepository.findOne(consulting_room_id);
            // find service
            const service = await this.serviceRepository.findOne(serviceType);

            const appointment = await this.appointmentRepository.saveAppointment(appointmentDto, patient, specialization, department, consultingRoom, service);
            // update patient appointment date
            patient.lastAppointmentDate = new Date().toString();
            await patient.save();

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

    listAppointments(params) {
        const {startDate, endDate} = params;
        const query = this.queueSystemRepository.createQueryBuilder('q');
        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.where(`q.createdAt >= '${start}'`);
        }
        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.where(`q.createdAt <= '${end}'`);
        }
        const result = query.getRawMany();

        return result;
    }

    async checkAppointmentStatus(params) {
        const {patient_id, service_id} = params;
        // find service
        const service = await this.serviceRepository.findOne(service_id);
        const gracePeriodParams = service.gracePeriod.split(' ');
        let limit = service.noOfVisits;
        const duration = parseInt(gracePeriodParams[0], 10);
        if (duration > limit) {
            limit = duration;
        }
        // find patient last appointment
        const appointments = await this.appointmentRepository.createQueryBuilder('appointment')
                .where('appointment.patient_id = :patient_id', {patient_id})
                .andWhere('appointment.service_id = :service_id', {service_id})
                .select(['appointment.createdAt as created_at'])
                .orderBy('appointment.createdAt', 'DESC')
                .limit(limit)
                .getRawMany();
        if (appointments.length) {
            const lastVisit = moment(appointments[0].created_at);
            // calculate current grace period
            // eslint-disable-next-line
            // const gracePeriod = moment().subtract("1", gracePeriodParams[1]).startOf('day');
            // // check if previous visit is within grace period
            // if (this.isWithinGracePeriod(lastVisit, gracePeriod)) {
            //     // if () {
            //     // }
            //     return {isPaying: false, amount: 0};
            // } else {
            //     return {isPaying: true, amount: parseFloat(service.tariff)};
            // }
        } else {
            return {isPaying: true, amount: parseFloat(service.tariff), appointments};
        }
    }

    private isWithinGracePeriod(lastVisit, gracePeriod) {
        return lastVisit.isAfter(gracePeriod);
    }
}
