import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { StaffRepository } from './staff.repository';
import { RoleRepository } from '../../settings/roles-permissions/role.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { AuthRepository } from '../../auth/auth.repository';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { SpecializationRepository } from '../../settings/specialization/specialization.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        StaffRepository,
        AuthRepository,
        RoleRepository,
        DepartmentRepository,
        AppointmentRepository,
        SpecializationRepository,
    ])],
    controllers: [StaffController],
    providers: [StaffService],
})
export class StaffModule {
}
