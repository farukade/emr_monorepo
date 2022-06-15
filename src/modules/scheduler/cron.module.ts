import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRepository } from '../attendance/attendance.repository';
import { TasksService } from './cron.service';

@Module({
    imports: [TypeOrmModule.forFeature([
        AttendanceRepository
    ])],
    providers: [TasksService],
})
export class TasksModule {
}
