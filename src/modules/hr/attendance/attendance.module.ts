import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceRepository } from './repositories/attendance.repository';
import { AttendanceService } from './attendance.service';
import { DeviceRepository } from './repositories/device.repositories';
import { StaffRepository } from '../staff/staff.repository';
import { BioUserRepository } from './repositories/device-user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceRepository,
      DeviceRepository,
      StaffRepository,
      BioUserRepository
    ])
  ],
  providers: [AttendanceService],
  controllers: [AttendanceController],
})
export class AttendanceModule { }
