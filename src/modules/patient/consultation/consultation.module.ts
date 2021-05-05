import { Module } from '@nestjs/common';
import { ConsultationController } from './consultation.controller';
import { ConsultationService } from './consultation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncounterRepository } from './encounter.repository';
import { PatientAllergenRepository } from '../repositories/patient_allergen.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { StockRepository } from '../../inventory/stock.repository';
import { AppGateway } from '../../../app.gateway';
import { QueueSystemRepository } from '../../frontdesk/queue-system/queue-system.repository';
import { ConsumableRepository } from '../../settings/consumable/consumable.repository';
import { AuthRepository } from '../../auth/auth.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        EncounterRepository,
        PatientAllergenRepository,
        PatientRepository,
        AppointmentRepository,
        StockRepository,
        QueueSystemRepository,
        ConsumableRepository,
        AuthRepository,
    ])],
    controllers: [ConsultationController],
    providers: [ AppGateway, ConsultationService],
})
export class ConsultationModule {}
