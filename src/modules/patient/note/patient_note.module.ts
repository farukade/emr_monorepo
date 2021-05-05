import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { PatientNoteController } from './patient_note.controller';
import { PatientNoteService } from './patient_note.service';
import { PatientRepository } from '../repositories/patient.repository';
import { AuthRepository } from '../../auth/auth.repository';

@Module({
    imports: [TypeOrmModule.forFeature([PatientNoteRepository, PatientRepository, AuthRepository])],
    controllers: [PatientNoteController],
    providers: [PatientNoteService],
})
export class PatientNoteModule {
}
