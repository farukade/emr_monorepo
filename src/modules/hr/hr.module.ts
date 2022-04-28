import { Module } from '@nestjs/common';
import { StaffModule } from './staff/staff.module';
import { LeavemgtModule } from './leavemgt/leavemgt.module';
import { HousekeepingModule } from './housekeeping/housekeeping.module';
import { AppraisalModule } from './appraisal/appraisal.module';

@Module({
	imports: [StaffModule, LeavemgtModule, HousekeepingModule, AppraisalModule],
	controllers: [],
})
export class HRModule {}
