import { Module } from '@nestjs/common';
import { LeavemgtController } from './leavemgt.controller';
import { LeavemgtService } from './leavemgt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveApplicationRepository } from './leave_application.repository';
import { StaffRepository } from '../staff/staff.repository';
import { LeaveCategoryRepository } from '../../settings/leave-category/leave.category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveApplicationRepository, StaffRepository, LeaveCategoryRepository])],
  controllers: [LeavemgtController],
  providers: [LeavemgtService],
})
export class LeavemgtModule {}
