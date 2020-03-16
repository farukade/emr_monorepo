import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffModule } from './staff/staff.module';
import { LeavemgtModule } from './leavemgt/leavemgt.module';
import { HousekeepingModule } from './housekeeping/housekeeping.module';
import { PayrollModule } from './payroll/payroll.module';
import { AppraisalModule } from './appraisal/appraisal.module';

@Module({
    imports: [
        StaffModule,
        LeavemgtModule,
        HousekeepingModule,
        PayrollModule,
        AppraisalModule,
    ],
    controllers: [],
})
export class HRModule {}
