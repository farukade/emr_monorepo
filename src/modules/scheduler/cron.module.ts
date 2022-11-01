import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentRepository } from '../frontdesk/appointment/appointment.repository';
import { AttendanceService } from '../hr/attendance/attendance.service';
import { AttendanceRepository } from '../hr/attendance/repositories/attendance.repository';
import { BioUserRepository } from '../hr/attendance/repositories/device-user.repository';
import { DeviceRepository } from '../hr/attendance/repositories/device.repositories';
import { StaffRepository } from '../hr/staff/staff.repository';
import { PatientRepository } from '../patient/repositories/patient.repository';
import { QueueModule } from '../queue/queue.module';
import { QueueService } from '../queue/queue.service';
import { DepartmentRepository } from '../settings/departments/department.repository';
import { TasksService } from './cron.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceRepository,
      DeviceRepository,
      StaffRepository,
      BioUserRepository,
      PatientRepository,
      DepartmentRepository,
      AppointmentRepository,
    ]),
    QueueModule
  ],
  providers: [TasksService, AttendanceService],
})
export class TasksModule { }
