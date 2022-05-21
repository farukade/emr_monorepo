import { Module } from '@nestjs/common';
import { StaffModule } from './staff/staff.module';
import { LeaveModule } from './leavemgt/leave.module';
import { HousekeepingModule } from './housekeeping/housekeeping.module';
import { AppraisalModule } from './appraisal/appraisal.module';

@Module({
  imports: [StaffModule, LeaveModule, HousekeepingModule, AppraisalModule],
  controllers: [],
})
export class HRModule {}
