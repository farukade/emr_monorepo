import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffModule } from './staff/staff.module';
import { LeavemgtModule } from './leavemgt/leavemgt.module';
import { HousekeepingModule } from './housekeeping/housekeeping.module';
import { PayrollModule } from './payroll/payroll.module';

@Module({
    imports: [
        StaffModule,
        LeavemgtModule,
        HousekeepingModule,
        PayrollModule,
    ],
    controllers: [],
})
export class HRModule {}
