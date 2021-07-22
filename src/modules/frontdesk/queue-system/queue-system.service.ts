import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';

import { QueueSystemRepository } from './queue-system.repository';
import { Queue } from './queue.entity';
import { AppointmentRepository } from '../appointment/appointment.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { AppGateway } from '../../../app.gateway';
import { PatientRepository } from '../../patient/repositories/patient.repository';

@Injectable()
export class QueueSystemService {
    constructor(
        @InjectRepository(QueueSystemRepository)
        private queueSystemRepository: QueueSystemRepository,
        @InjectRepository(DepartmentRepository)
        private departmentRepository: DepartmentRepository,
        @InjectRepository(AppointmentRepository)
        private appointmentRepository: AppointmentRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        private readonly appGateway: AppGateway,
    ) {
    }

    async fetchQueueList(): Promise<Queue[]> {
        const today = moment().format('YYYY-MM-DD');

        return await this.queueSystemRepository.find({
            where: { queueDate: today, status: 1 },
            relations: ['appointment', 'appointment.patient', 'appointment.whomToSee',
                'appointment.consultingRoom', 'appointment.serviceCategory', 'appointment.service'],
            // take: 10,
            order: {
                queueNumber: 'ASC',
            },
        });
    }

    async fetchVitalsQueueList(): Promise<Queue[]> {
        const today = moment().format('YYYY-MM-DD');

        return await this.queueSystemRepository.find({
            where: { queueDate: today, status: 1, queueType: 'vitals' },
            relations: ['patient', 'appointment', 'appointment.patient', 'appointment.whomToSee',
                'appointment.consultingRoom', 'appointment.serviceCategory', 'appointment.service'],
            order: {
                queueNumber: 'ASC',
            },
        });
    }

    async addToQueue(id, { patient_id, department_id, queue_id }) {
        try {
            const appointment = await this.appointmentRepository.findOne(id, { relations: ['patient'] });
            appointment.canSeeDoctor = 1;
            await appointment.save();

            const patient = await this.patientRepository.findOne(patient_id);

            const oldQueue = await this.queueSystemRepository.findOne(queue_id);
            oldQueue.status = 2;
            oldQueue.patient = patient;
            await oldQueue.save();

            // save queue
            const queue = await this.queueSystemRepository.saveQueue(appointment, 'doctor', patient);
            console.log(queue);

            // // send new queue message
            this.appGateway.server.emit('consultation-queue', { success: true, queue });
            return { success: true, queue };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }
}
