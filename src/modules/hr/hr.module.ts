import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffRepository } from './repositories/staff.repository';

@Module({
    imports: [TypeOrmModule.forFeature([StaffRepository])],
    controllers: [StaffController],
})
export class HRModule {}
