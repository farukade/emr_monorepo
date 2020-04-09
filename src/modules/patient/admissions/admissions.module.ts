import { Module } from '@nestjs/common';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmissionsRepository } from './repositories/admissions.repository';
import { AdmissionClinicalTaskRepository } from './repositories/admission-clinical-tasks.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';

@Module({
  imports: [TypeOrmModule.forFeature([
    AdmissionsRepository,
    AdmissionClinicalTaskRepository,
    PatientRepository,
    StaffRepository,
  ])],
  controllers: [AdmissionsController],
  providers: [AdmissionsService],
})
export class AdmissionsModule {}
