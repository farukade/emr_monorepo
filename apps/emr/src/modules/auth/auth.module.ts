import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { StaffRepository } from '../hr/staff/staff.repository';
import { RoleRepository } from '../settings/roles-permissions/role.repository';
import { DepartmentRepository } from '../settings/departments/department.repository';
import { SpecializationRepository } from '../settings/specialization/specialization.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthRepository,
      StaffRepository,
      RoleRepository,
      DepartmentRepository,
      SpecializationRepository,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
