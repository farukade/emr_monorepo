import { Module } from '@nestjs/common';
import { ConsultationController } from './consultation.controller';
import { ConsultationService } from './consultation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncounterRepository } from './encounter.repository';
import { PatientAllergyRepository } from '../repositories/patient_allergy.repository';
import { PatientRepository } from '../repositories/patient.repository';
@Module({
    imports: [TypeOrmModule.forFeature([
        EncounterRepository,
        PatientAllergyRepository,
        PatientRepository,
    ])],
    controllers: [ConsultationController],
    providers: [ ConsultationService],
})
export class ConsultationModule {}
