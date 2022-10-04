import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from '../hr/attendance/attendance.service';
import { AttendanceRepository } from '../hr/attendance/repositories/attendance.repository';
import { BioUserRepository } from '../hr/attendance/repositories/device-user.repository';
import { DeviceRepository } from '../hr/attendance/repositories/device.repositories';
import { StaffRepository } from '../hr/staff/staff.repository';
import { TasksService } from './cron.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
    AttendanceRepository,
    DeviceRepository,
    StaffRepository, 
    BioUserRepository
  ])],
  providers: [TasksService, AttendanceService],
})
export class TasksModule {}
