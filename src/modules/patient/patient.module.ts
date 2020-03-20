import { Module } from '@nestjs/common';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientRepository } from './repositories/patient.repository';
import { PatientNOKRepository } from './repositories/patient.nok.repository';
import { ServiceRepository } from '../settings/services/service.repository';
import { PatientVitalRepository } from './repositories/patient_vitals.repository';
import { PatientAntenatalRepository } from './repositories/patient_antenatal.repository';
import { PatientAllergyRepository } from './repositories/patient_allergy.repository';

@Module({
  imports: [TypeOrmModule.forFeature([
    PatientRepository,
    PatientNOKRepository,
    PatientVitalRepository,
    PatientAntenatalRepository,
    PatientAllergyRepository,
    ServiceRepository])],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}
