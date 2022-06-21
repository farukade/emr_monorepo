import { Module } from '@nestjs/common';
import { ImmunizationController } from './immunization.controller';
import { ImmunizationService } from './immunization.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImmunizationRepository } from './repositories/immunization.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ImmunizationRepository, PatientRepository, StaffRepository])],
  controllers: [ImmunizationController],
  providers: [ImmunizationService],
})
export class ImmunizationModule {}
