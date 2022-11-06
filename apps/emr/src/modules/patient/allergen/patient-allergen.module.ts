import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientAllergenService } from './patient-allergen.service';
import { PatientAllergenController } from './patient-allergen.controller';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { DrugGenericRepository } from '../../inventory/pharmacy/generic/generic.repository';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { NicuRepository } from '../nicu/nicu.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientNoteRepository,
      PatientRepository,
      DrugGenericRepository,
      AdmissionsRepository,
      NicuRepository,
    ]),
  ],
  providers: [PatientAllergenService],
  controllers: [PatientAllergenController],
})
export class PatientAllergenModule {}
