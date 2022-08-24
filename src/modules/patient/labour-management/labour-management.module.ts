import { Module } from '@nestjs/common';
import { LabourManagementController } from './labour-management.controller';
import { LabourManagementService } from './labour-management.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabourEnrollmentRepository } from './repositories/labour-enrollment.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { AppGateway } from '../../../app.gateway';
import { AntenatalEnrollmentRepository } from '../antenatal/enrollment.repository';
import { LabourMeasurementRepository } from './repositories/labour-measurement.repository';
import { LabourRiskAssessmentRepository } from './repositories/labour-risk-assessment.repository';
import { LabourDeliveryRecordRepository } from './repositories/labour-delivery-record.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LabourEnrollmentRepository,
      PatientRepository,
      AntenatalEnrollmentRepository,
      LabourMeasurementRepository,
      LabourRiskAssessmentRepository,
      LabourDeliveryRecordRepository,
      StaffRepository,
    ]),
  ],
  controllers: [LabourManagementController],
  providers: [AppGateway, LabourManagementService],
})
export class LabourManagementModule {}
