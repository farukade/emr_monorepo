import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    @Cron('45 * * * * *')
    handleCron() {
        this.logger.debug('Called when the current second is 45');
    }

    @Cron('*/10 * * * * *')
    runEvery10Seconds() {
        console.log('Every 10 seconds');
    }

    @Cron(CronExpression.EVERY_MINUTE)
    runEveryMinute() {
        console.log('Every minute');
    }

    @Timeout(15000)
    onceAfter15Seconds() {
        console.log('Called once after 15 seconds');
    }
}
