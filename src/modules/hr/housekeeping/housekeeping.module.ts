import { Module } from '@nestjs/common';
import { HousekeepingService } from './housekeeping.service';
import { HousekeepingController } from './housekeeping.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoasterRepository } from './roaster.repository';
import { RoasterItemRepository } from './roaster.item.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { StaffRepository } from '../staff/staff.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RoasterRepository, RoasterItemRepository, DepartmentRepository, StaffRepository])],
  providers: [HousekeepingService],
  controllers: [HousekeepingController],
})
export class HousekeepingModule {}
