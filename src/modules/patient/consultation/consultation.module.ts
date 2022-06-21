import { Module } from '@nestjs/common';
import { ConsultationController } from './consultation.controller';
import { ConsultationService } from './consultation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncounterRepository } from './encounter.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { AppGateway } from '../../../app.gateway';
import { QueueSystemRepository } from '../../frontdesk/queue-system/queue-system.repository';
import { AuthRepository } from '../../auth/auth.repository';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { DrugGenericRepository } from '../../inventory/pharmacy/generic/generic.repository';
import { StoreInventoryRepository } from '../../inventory/store/store.repository';
import { PatientVitalRepository } from '../repositories/patient_vitals.repository';
import { PatientRequestRepository } from '../repositories/patient_request.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EncounterRepository,
      PatientRepository,
      AppointmentRepository,
      DrugGenericRepository,
      QueueSystemRepository,
      AuthRepository,
      PatientNoteRepository,
      StoreInventoryRepository,
      PatientVitalRepository,
      PatientRequestRepository,
      StaffRepository,
      DepartmentRepository,
    ]),
  ],
  controllers: [ConsultationController],
  providers: [AppGateway, ConsultationService],
})
export class ConsultationModule {}
