import { Module } from '@nestjs/common';
import { StaffModule } from './staff/staff.module';
import { PayrollModule } from './payroll/payroll.module';
import { HousekeepingModule } from './housekeeping/housekeeping.module';
import { LeavemgtModule } from './leavemgt/leavemgt.module';

@Module({
    imports: [
        StaffModule,
        PayrollModule,
    ],
})
export class HRModule {}
