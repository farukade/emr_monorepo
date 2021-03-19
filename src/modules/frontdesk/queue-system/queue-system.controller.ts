import {Body, Controller, Get, Post} from '@nestjs/common';
import { QueueSystemService } from './queue-system.service';
import { Queue } from './queue.entity';

@Controller('front-desk/queue-system')
export class QueueSystemController {
    constructor(private queueSystemService: QueueSystemService) {}

    @Get('get-lists')
    getQueueList(): Promise<Queue[]> {
        return this.queueSystemService.fetchQueueList();
    }

    @Get('get-vitals-queue-lists')
    fetchVitalsQueueList(): Promise<Queue[]> {
        return this.queueSystemService.fetchVitalsQueueList();
    }

    @Post('add')
    addToQueue(
        @Body() params,
    ) {
        return this.queueSystemService.addToQueue(params);
    }
}
