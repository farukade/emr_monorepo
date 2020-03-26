import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueueSystemRepository } from './queue-system.repository';
import { Queue } from './queue.entity';
import * as moment from 'moment';

@Injectable()
export class QueueSystemService {
    constructor(
        @InjectRepository(QueueSystemRepository)
        private queueSystemRepository: QueueSystemRepository,
    ) {}

    async fetchQueueList(): Promise<Queue[]> {
        const today = moment().format('YYYY-MM-DD');

        const queues = await this.queueSystemRepository.find({
            where: {createdAt: today, status: 1},
            relations: ['appointment', 'appointment.patient'],
            take: 10,
        });

        return queues;
    }
}
