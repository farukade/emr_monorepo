import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRepository } from '../hr/attendance/repositories/attendance.repository';
import { DeviceRepository } from '../hr/attendance/repositories/device.repositories';
import { TasksService } from './cron.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
    AttendanceRepository,
    DeviceRepository
  ])],
  providers: [TasksService],
})
export class TasksModule {}
