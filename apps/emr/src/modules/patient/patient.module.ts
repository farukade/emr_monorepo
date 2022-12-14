import { Module } from '@nestjs/common';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientRepository } from './repositories/patient.repository';
import { PatientNOKRepository } from './repositories/patient.nok.repository';
import { ServiceRepository } from '../settings/services/repositories/service.repository';
import { PatientVitalRepository } from './repositories/patient_vitals.repository';
import { PatientAntenatalRepository } from './repositories/patient_antenatal.repository';
import { VoucherRepository } from '../finance/vouchers/voucher.repository';
import { PatientDocumentRepository } from './repositories/patient_document.repository';
import { AntenatalModule } from './antenatal/antenatal.module';
import { AdmissionsModule } from './admissions/admissions.module';
import { ConsultationModule } from './consultation/consultation.module';
import { LabourManagementModule } from './labour-management/labour-management.module';
import { IvfEnrollmentRepository } from './ivf/repositories/ivf_enrollment.repository';
import { StaffRepository } from '../hr/staff/staff.repository';
import { AppGateway } from '../../app.gateway';
import { AppointmentRepository } from '../frontdesk/appointment/appointment.repository';
import { ImmunizationModule } from './immunization/immunization.module';
import { NicuModule } from './nicu/nicu.module';
import { TransactionsRepository } from '../finance/transactions/transactions.repository';
import { AdmissionClinicalTaskRepository } from './admissions/repositories/admission-clinical-tasks.repository';
import { AdmissionsRepository } from './admissions/repositories/admissions.repository';
import { ImmunizationRepository } from './immunization/repositories/immunization.repository';
import { PatientRequestItemRepository } from './repositories/patient_request_items.repository';
import { PatientRequestModule } from './requests/patient_request.module';
import { IvfModule } from './ivf/ivf.module';
import { PatientAllergenModule } from './allergen/patient-allergen.module';
import { PatientConsumableRepository } from './consumable/patient-consumable.repository';
import { PatientConsumableModule } from './consumable/patient-consumable.module';
import { PatientFluidChartModule } from './fluid-chart/patient_fluid_chart.module';
import { PatientNoteModule } from './note/patient_note.module';
import { PatientAlertRepository } from './repositories/patient_alert.repository';
import { HmoSchemeRepository } from '../hmo/repositories/hmo_scheme.repository';
import { LabTestRepository } from '../settings/lab/repositories/lab.test.repository';
import { ServiceCategoryRepository } from '../settings/services/repositories/service_category.repository';
import { ServiceCostRepository } from '../settings/services/repositories/service_cost.repository';
import { CareTeamModule } from './care-team/team.module';
import { PatientNoteRepository } from './repositories/patient_note.repository';
import { NicuRepository } from './nicu/nicu.repository';
import { LabourEnrollmentRepository } from './labour-management/repositories/labour-enrollment.repository';
import { ExcuseDutyModule } from './excuse-duty/excuse-duty.module';
import { AntenatalEnrollmentRepository } from './antenatal/enrollment.repository';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientRepository,
      ImmunizationRepository,
      PatientDocumentRepository,
      PatientNOKRepository,
      PatientVitalRepository,
      PatientAntenatalRepository,
      PatientRequestItemRepository,
      HmoSchemeRepository,
      ServiceRepository,
      ServiceCategoryRepository,
      VoucherRepository,
      IvfEnrollmentRepository,
      StaffRepository,
      AppointmentRepository,
      TransactionsRepository,
      AdmissionClinicalTaskRepository,
      AdmissionsRepository,
      LabTestRepository,
      PatientConsumableRepository,
      PatientAlertRepository,
      ServiceCostRepository,
      PatientNoteRepository,
      NicuRepository,
      LabourEnrollmentRepository,
      AntenatalEnrollmentRepository,
    ]),
    AntenatalModule,
    AdmissionsModule,
    ConsultationModule,
    LabourManagementModule,
    ImmunizationModule,
    NicuModule,
    PatientRequestModule,
    IvfModule,
    PatientAllergenModule,
    PatientConsumableModule,
    PatientNoteModule,
    PatientFluidChartModule,
    QueueModule,
    CareTeamModule,
    ExcuseDutyModule,
  ],
  controllers: [PatientController],
  providers: [AppGateway, PatientService],
})
export class PatientModule {}
