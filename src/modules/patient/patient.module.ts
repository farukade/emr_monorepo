import { Module } from '@nestjs/common';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientRepository } from './repositories/patient.repository';
import { PatientNOKRepository } from './repositories/patient.nok.repository';
import { ServiceRepository } from '../settings/services/service.repository';
import { PatientVitalRepository } from './repositories/patient_vitals.repository';
import { PatientAntenatalRepository } from './repositories/patient_antenatal.repository';
import { PatientAllergenRepository } from './repositories/patient_allergen.repository';
import { HmoRepository } from '../hmo/hmo.repository';
import { VoucherRepository } from '../finance/vouchers/voucher.repository';
import { PatientDocumentRepository } from './repositories/patient_document.repository';
import { AntenatalModule } from './antenatal/antenatal.module';
import { AdmissionsModule } from './admissions/admissions.module';
import { ConsultationModule } from './consultation/consultation.module';
import { LabourManagementModule } from './labour-management/labour-management.module';
import { IvfEnrollmentRepository } from './ivf/ivf_enrollment.repository';
import { StaffRepository } from '../hr/staff/staff.repository';
import { AppGateway } from '../../app.gateway';
import { AppointmentRepository } from '../frontdesk/appointment/appointment.repository';
import { ImmunizationModule } from './immunization/immunization.module';
import { NicuModule } from './nicu/nicu.module';
import { AuthRepository } from '../auth/auth.repository';
import { TransactionsRepository } from '../finance/transactions/transactions.repository';
import { AdmissionClinicalTaskRepository } from './admissions/repositories/admission-clinical-tasks.repository';
import { AdmissionsRepository } from './admissions/repositories/admissions.repository';
import { ImmunizationRepository } from './immunization/repositories/immunization.repository';
import { PatientRequestItemRepository } from './repositories/patient_request_items.repository';
import { LabTestRepository } from '../settings/lab/lab.test.repository';
import { PatientDiagnosisRepository } from './repositories/patient_diagnosis.repository';
import { PatientRequestModule } from './requests/patient_request.module';
import { IvfModule } from './ivf/ivf.module';
import { PatientAllergenModule } from './allergen/patient-allergen.module';
import { PatientConsumableRepository } from './consumable/patient-consumable.repository';
import { PatientConsumableModule } from './consumable/patient-consumable.module';
import { MailService } from '../mail/mail.service';
import { PatientFluidChartModule } from './fluid-chart/patient_fluid_chart.module';
import { PatientNoteModule } from './note/patient_note.module';
import { PatientAlertRepository } from './repositories/patient_alert.repository';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [TypeOrmModule.forFeature([
        PatientRepository,
        ImmunizationRepository,
        PatientDocumentRepository,
        PatientNOKRepository,
        PatientVitalRepository,
        PatientAntenatalRepository,
        PatientRequestItemRepository,
        PatientAllergenRepository,
        HmoRepository,
        ServiceRepository,
        VoucherRepository,
        IvfEnrollmentRepository,
        StaffRepository,
        AppointmentRepository,
        AuthRepository,
        TransactionsRepository,
        AdmissionClinicalTaskRepository,
        AdmissionsRepository,
        LabTestRepository,
        PatientDiagnosisRepository,
        PatientConsumableRepository,
        PatientAlertRepository,
        // tslint:disable-next-line:max-line-length
    ]), AntenatalModule, AdmissionsModule, ConsultationModule, LabourManagementModule, ImmunizationModule, NicuModule, PatientRequestModule, IvfModule, PatientAllergenModule, PatientConsumableModule, PatientNoteModule, PatientFluidChartModule, MailModule],
    controllers: [PatientController],
    providers: [AppGateway, PatientService],
})
export class PatientModule {
}
