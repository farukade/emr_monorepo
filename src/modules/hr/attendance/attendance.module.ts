import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceRepository } from './repositories/attendance.repository';
import { AttendanceService } from './attendance.service';
import { DeviceRepository } from './repositories/device.repositories';
import { AttendanceStaffRepository } from './repositories/attendance-staff.repository';
import { AttendanceDepartmentRepository } from './repositories/attendance-department.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceRepository,
      DeviceRepository,
      AttendanceStaffRepository,
      AttendanceDepartmentRepository
    ])
  ],
  providers: [AttendanceService],
  controllers: [AttendanceController],
})
export class AttendanceModule { }
