import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientAllergenService } from './patient-allergen.service';
import { PatientAllergenController } from './patient-allergen.controller';
import { PatientAllergenRepository } from '../repositories/patient_allergen.repository';
import { PatientRepository } from '../repositories/patient.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        PatientAllergenRepository,
        PatientRepository,
    ])],
    providers: [PatientAllergenService],
    controllers: [PatientAllergenController],
})
export class PatientAllergenModule {
}
