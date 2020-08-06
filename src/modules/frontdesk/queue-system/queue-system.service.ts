import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueueSystemRepository } from './queue-system.repository';
import { Queue } from './queue.entity';
import * as moment from 'moment';
import {AppointmentRepository} from "../appointment/appointment.repository";
import {DepartmentRepository} from "../../settings/departments/department.repository";
import {AppGateway} from "../../../app.gateway";

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
            where: {createdAt: today, status: 1},
            relations: ['appointment', 'appointment.patient', 'appointment.specialization', 'appointment.department',
                'appointment.consultingRoom', 'appointment.serviceCategory', 'appointment.serviceType',
                'department'],
            // take: 10,
            order: {
                queueNumber: 'ASC',
            },
        });
    }

    async addToQueue({patient_id,  department_id}) {
        try {
            // find appointment
            const appointment = await this.appointmentRepository
                .createQueryBuilder('appointment')
                .leftJoinAndSelect('appointment.patient', 'patient')
                .where('appointment.patient_id = :patient_id', {patient_id})
                .andWhere('appointment.isActive = :status', {status: true})
                .getOne();
            // save queue
            const queue = await this.queueSystemRepository.saveQueue(appointment, 'department');
            // send new queue message
            this.appGateway.server.emit('new-queue', queue);

            return {success: true, queue};
        } catch (e) {
            return {success: false, message: e.message};
        }
    }
}
