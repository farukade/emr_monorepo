import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { PatientNoteController } from './patient_note.controller';
import { PatientNoteService } from './patient_note.service';
import { PatientRepository } from '../repositories/patient.repository';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { PatientRequestItemRepository } from '../repositories/patient_request_items.repository';
import { IvfEnrollmentRepository } from '../ivf/repositories/ivf_enrollment.repository';
import { AntenatalEnrollmentRepository } from '../antenatal/enrollment.repository';
import { DrugGenericRepository } from '../../inventory/pharmacy/generic/generic.repository';
import { LabourEnrollmentRepository } from '../labour-management/repositories/labour-enrollment.repository';
import { NicuRepository } from '../nicu/nicu.repository';
import { PatientAlertRepository } from '../repositories/patient_alert.repository';
import { EncounterRepository } from '../consultation/encounter.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientNoteRepository,
      PatientRepository,
      AdmissionsRepository,
      PatientRequestItemRepository,
      IvfEnrollmentRepository,
      AntenatalEnrollmentRepository,
      DrugGenericRepository,
      LabourEnrollmentRepository,
      NicuRepository,
      PatientAlertRepository,
      EncounterRepository,
    ]),
  ],
  controllers: [PatientNoteController],
  providers: [PatientNoteService],
})
export class PatientNoteModule {}
