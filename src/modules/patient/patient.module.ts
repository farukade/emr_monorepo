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
import { PatientRequestRepository } from './repositories/patient_request.repository';
import { HmoRepository } from '../hmo/hmo.repository';
import { VoucherRepository } from '../finance/vouchers/voucher.repository';
import { PatientDocumentRepository } from './repositories/patient_document.repository';
import { AntenatalModule } from './antenatal/antenatal.module';
import { AdmissionsModule } from './admissions/admissions.module';
import { ImmunizationRepository } from './repositories/immunization.repository';
import { ConsultationModule } from './consultation/consultation.module';
import { LabourManagementModule } from './labour-management/labour-management.module';
import { IvfController } from './ivf/ivf.controller';
import { IvfService } from './ivf/ivf.service';
import { IvfEnrollmentRepository } from './ivf/ivf_enrollment.repository';
import { StaffRepository } from '../hr/staff/staff.repository';

@Module({
  imports: [TypeOrmModule.forFeature([
    PatientRepository,
    PatientDocumentRepository,
    PatientNOKRepository,
    PatientVitalRepository,
    PatientAntenatalRepository,
    PatientRequestRepository,
    PatientAllergyRepository,
    HmoRepository,
    ServiceRepository,
    ImmunizationRepository,
    VoucherRepository,
    IvfEnrollmentRepository,
    StaffRepository,
  ]), AntenatalModule, AdmissionsModule, ConsultationModule, LabourManagementModule],
  controllers: [PatientController, IvfController],
  providers: [PatientService, IvfService],
})
export class PatientModule {}
