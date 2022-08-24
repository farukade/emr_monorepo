import { Module } from '@nestjs/common';
import { PatientRequestRepository } from '../repositories/patient_request.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientRequestItemRepository } from '../repositories/patient_request_items.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { AppGateway } from '../../../app.gateway';
import { IvfController } from './ivf.controller';
import { IvfService } from './ivf.service';
import { IvfEnrollmentRepository } from './repositories/ivf_enrollment.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { IvfHcgRepository } from './repositories/hcg.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientRequestRepository,
      StaffRepository,
      PatientRequestItemRepository,
      IvfEnrollmentRepository,
      PatientRepository,
      IvfHcgRepository
    ]),
  ],
  controllers: [IvfController],
  providers: [AppGateway, IvfService],
})
export class IvfModule {}
