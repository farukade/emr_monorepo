import { Module } from '@nestjs/common';
import { ConsultationController } from './consultation.controller';
import { ConsultationService } from './consultation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncounterRepository } from './encounter.repository';
import { PatientAllergenRepository } from '../repositories/patient_allergen.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { AppGateway } from '../../../app.gateway';
import { QueueSystemRepository } from '../../frontdesk/queue-system/queue-system.repository';
import { AuthRepository } from '../../auth/auth.repository';
import { PatientDiagnosisRepository } from '../repositories/patient_diagnosis.repository';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { DrugGenericRepository } from '../../inventory/pharmacy/generic/generic.repository';
import { StoreInventoryRepository } from '../../inventory/store/store.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        EncounterRepository,
        PatientAllergenRepository,
        PatientRepository,
        AppointmentRepository,
        DrugGenericRepository,
        QueueSystemRepository,
        AuthRepository,
        PatientDiagnosisRepository,
        PatientNoteRepository,
        StoreInventoryRepository,
    ])],
    controllers: [ConsultationController],
    providers: [ AppGateway, ConsultationService],
})
export class ConsultationModule {}
