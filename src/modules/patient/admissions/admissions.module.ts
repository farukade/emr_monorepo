import { Module } from '@nestjs/common';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmissionsRepository } from './repositories/admissions.repository';
import { AdmissionClinicalTaskRepository } from './repositories/admission-clinical-tasks.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { RoomRepository } from '../../settings/room/room.repository';
import { AppGateway } from '../../../app.gateway';
import { PatientVitalRepository } from '../repositories/patient_vitals.repository';
import { NicuRepository } from '../nicu/nicu.repository';
import { AuthRepository } from '../../auth/auth.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        AuthRepository,
        AdmissionsRepository,
        AdmissionClinicalTaskRepository,
        PatientRepository,
        StaffRepository,
        RoomRepository,
        PatientVitalRepository,
        NicuRepository,
    ])],
    controllers: [AdmissionsController],
    providers: [AppGateway, AdmissionsService],
})
export class AdmissionsModule {
}
