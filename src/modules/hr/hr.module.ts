import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffModule } from './staff/staff.module';
import { LeavemgtModule } from './leavemgt/leavemgt.module';

@Module({
    imports: [
        StaffModule,
        LeavemgtModule,
    ],
    controllers: [],
})
export class HRModule {}
