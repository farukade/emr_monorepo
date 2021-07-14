import { Module } from '@nestjs/common';
import { TasksService } from './cron.service';

@Module({
    providers: [TasksService],
})
export class TasksModule {
}
