import { Module } from '@nestjs/common';
import { AntenatalService } from './antenatal.service';
import { AntenatalController } from './antenatal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentRepository } from './enrollment.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { AntenatalVisitRepository } from './antenatal-visits.repository';

@Module({
  imports: [TypeOrmModule.forFeature([
    AntenatalVisitRepository,
    EnrollmentRepository,
    PatientRepository,
  ])],
  providers: [AntenatalService],
  controllers: [AntenatalController],
})
export class AntenatalModule {}
