import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRepository } from '../hr/attendance/repositories/attendance.repository';
import { DeviceRepository } from '../hr/attendance/repositories/device.repositories';
import { StaffRepository } from '../hr/staff/staff.repository';
import { TasksService } from './cron.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
    AttendanceRepository,
    DeviceRepository,
    StaffRepository
  ])],
  providers: [TasksService],
})
export class TasksModule {}
