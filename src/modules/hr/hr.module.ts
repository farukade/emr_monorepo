import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffModule } from './staff/staff.module';
import { LeavemgtModule } from './leavemgt/leavemgt.module';
import { HousekeepingModule } from './housekeeping/housekeeping.module';

@Module({
    imports: [
        StaffModule,
        LeavemgtModule,
        HousekeepingModule,
    ],
    controllers: [],
})
export class HRModule {}
