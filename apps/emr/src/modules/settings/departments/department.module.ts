import { Module } from '@nestjs/common';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentRepository } from './department.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DepartmentRepository, StaffRepository])],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
})
export class DepartmentModule {}
