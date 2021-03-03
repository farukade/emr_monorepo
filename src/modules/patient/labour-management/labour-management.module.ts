import { Module } from '@nestjs/common';
import { LabourManagementController } from './labour-management.controller';
import { LabourManagementService } from './labour-management.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabourEnrollmentRepository } from './repositories/labour-enrollment.repository';
import { LabourMeasurementRepository } from './repositories/labour-measurement.repository';
import { LabourVitalRepository } from './repositories/labour-vital.repository';
import { LabourDeliveryRecordRepository } from './repositories/labour-delivery-record.repository';
import { LabourRiskAssessmentRepository } from './repositories/labour-risk-assessment.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { LabTestRepository } from '../../settings/lab/lab.test.repository';
import { AppGateway } from '../../../app.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([
    LabourEnrollmentRepository,
    LabourMeasurementRepository,
    LabourVitalRepository,
    LabourDeliveryRecordRepository,
    LabourRiskAssessmentRepository,
    PatientRepository,
    StaffRepository,
    LabTestRepository,
  ])],
  controllers: [LabourManagementController],
  providers: [AppGateway, LabourManagementService]
})
export class LabourManagementModule {}
