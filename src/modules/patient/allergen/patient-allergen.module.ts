import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientAllergenService } from './patient-allergen.service';
import { PatientAllergenController } from './patient-allergen.controller';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientNoteRepository } from '../repositories/patient_note.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        PatientNoteRepository,
        PatientRepository,
    ])],
    providers: [PatientAllergenService],
    controllers: [PatientAllergenController],
})
export class PatientAllergenModule {
}
