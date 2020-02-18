import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { StaffRepository } from './staff.repository';
import { UserRepository } from '../user.repository';
import { RoleRepository } from '../../settings/roles-permissions/role.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StaffRepository, UserRepository, RoleRepository, DepartmentRepository])],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
