import { Module } from '@nestjs/common';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffRepository } from '../staff/staff.repository';
import { LeaveCategoryRepository } from '../../settings/leave-category/leave.category.repository';
import { DiagnosisRepository } from '../../settings/diagnosis/diagnosis.repository';
import { LeaveRepository } from './repositories/leave.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRepository, StaffRepository, LeaveCategoryRepository, DiagnosisRepository])],
  controllers: [LeaveController],
  providers: [LeaveService],
})
export class LeaveModule {}
