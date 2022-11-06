import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequisitionRepository } from './requisition.repository';
import { RequisitionController } from './requisition.controller';
import { RequisitionService } from './requisition.service';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { StoreInventoryRepository } from '../store/store.repository';
import { CafeteriaInventoryRepository } from '../cafeteria/cafeteria.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RequisitionRepository,
      StaffRepository,
      StoreInventoryRepository,
      CafeteriaInventoryRepository,
      DepartmentRepository,
    ]),
  ],
  providers: [RequisitionService],
  controllers: [RequisitionController],
})
export class RequisitionModule {}
