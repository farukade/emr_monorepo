import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExcuseDutyService } from './excuse-duty.service';
import { ExcuseDutyController } from './excuse-duty.controller';
import { ExcuseDutyRepository } from './excuse-duty.repository';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { NicuRepository } from '../nicu/nicu.repository';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { PatientRepository } from '../repositories/patient.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExcuseDutyRepository,
      AdmissionsRepository,
      NicuRepository,
      PatientNoteRepository,
      PatientRepository,
    ]),
  ],
  providers: [ExcuseDutyService],
  controllers: [ExcuseDutyController],
})
export class ExcuseDutyModule {}
