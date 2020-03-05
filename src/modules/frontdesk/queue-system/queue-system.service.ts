import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueueSystemRepository } from './queue-system.repository';
import { Queue } from './queue.entity';

@Injectable()
export class QueueSystemService {
    constructor(
        @InjectRepository(QueueSystemRepository)
        private queueSystemRepository: QueueSystemRepository,
    ) {}

    async fetchQueueList(): Promise<Queue[]> {
        const queues = await this.queueSystemRepository.find({take: 10});

        return queues;
    }
}
