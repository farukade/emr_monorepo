import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffRepository } from './staff/staff.repository';

@Module({
    imports: [TypeOrmModule.forFeature([StaffRepository])],
    controllers: [],
})
export class HRModule {}
