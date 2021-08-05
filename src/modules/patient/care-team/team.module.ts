import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareTeamService } from './team.service';
import { CareTeamController } from './team.controller';
import { CareTeamRepository } from './team.repository';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { PatientRepository } from '../repositories/patient.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        CareTeamRepository,
        AdmissionsRepository,
        StaffRepository,
        PatientRepository,
    ])],
    controllers: [CareTeamController],
    providers: [CareTeamService],
})
export class CareTeamModule {
}
