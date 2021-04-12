import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';

import { QueueSystemRepository } from './queue-system.repository';
import { Queue } from './queue.entity';
import {AppointmentRepository} from '../appointment/appointment.repository';
import {DepartmentRepository} from '../../settings/departments/department.repository';
import {AppGateway} from '../../../app.gateway';

@Injectable()
export class QueueSystemService {
    constructor(
        @InjectRepository(QueueSystemRepository)
        private queueSystemRepository: QueueSystemRepository,
        @InjectRepository(DepartmentRepository)
        private departmentRepository: DepartmentRepository,
        @InjectRepository(AppointmentRepository)
        private appointmentRepository: AppointmentRepository,
        private readonly appGateway: AppGateway,
    ) {}

    async fetchQueueList(): Promise<Queue[]> {
        const today = moment().format('YYYY-MM-DD');

        return await this.queueSystemRepository.find({
            where: {queueDate: today, status: 1},
            relations: ['appointment', 'appointment.patient', 'appointment.whomToSee',
                'appointment.consultingRoom', 'appointment.serviceCategory', 'appointment.serviceType'],
            // take: 10,
            order: {
                queueNumber: 'ASC',
            },
        });
    }

    async fetchVitalsQueueList(): Promise<Queue[]> {
        const today = moment().format('YYYY-MM-DD');

        return await this.queueSystemRepository.find({
            where: {queueDate: today, status: 1, queueType: 'vitals'},
            relations: ['appointment', 'appointment.patient', 'appointment.whomToSee',
                'appointment.consultingRoom', 'appointment.serviceCategory', 'appointment.serviceType'],
            // take: 10,
            order: {
                queueNumber: 'ASC',
            },
        });
    }

    async addToQueue({patient_id,  department_id, queue_id}) {
        try {
            // find appointment
            const appointment = await this.appointmentRepository
                .createQueryBuilder('appointment')
                .leftJoinAndSelect('appointment.patient', 'patient')
                .where('appointment.patient_id = :patient_id', {patient_id})
                .andWhere('appointment.isActive = :status', {status: true})
                .getOne();

            appointment.canSeeDoctor = 1;
            await appointment.save();
            const oldQueue = await this.queueSystemRepository.findOne(queue_id);
            console.log('OldQueue');
            console.log(oldQueue);
            oldQueue.status = 2;
            await oldQueue.save();
            // save queue
            const queue = await this.queueSystemRepository.saveQueue(appointment, 'doctor');
            // send new queue message
            this.appGateway.server.emit('consultation-queue', { success: true, queue });
            return { success: true, queue };
        } catch (e) {
            return {success: false, message: e.message};
        }
    }
}
