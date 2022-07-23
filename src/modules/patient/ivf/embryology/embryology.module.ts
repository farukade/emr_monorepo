import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffRepository } from 'src/modules/hr/staff/staff.repository';
import { PatientRepository } from '../../repositories/patient.repository';
import { EmbryologyController } from './embryology.controller';
import { IvfEmbryologyRepository } from './embryology.repository';
import { IvfEmbryologyService } from './embryology.service';
import { BiopsyRepository } from './repositories/biopsy.repository';
import { CellInfoRepository } from './repositories/cell-info.repository';
import { DayRecordsRepository } from './repositories/day-records.repository';
import { IvfEmbryoAssessmentRepository } from './repositories/embryo-assessment.repository';
import { EmbryoTransRecordRepository } from './repositories/embryo-trans-record.repository';
import { IvfEmbryoTranferRepository } from './repositories/embryo-transfer.repository';
import { IvfICSIRepository } from './repositories/icsi.repository';
import { IvfSpermPrepRepository } from './repositories/sperm-prep.repository';
import { IvfTreatmentRepository } from './repositories/treatment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IvfEmbryologyRepository,
      IvfEmbryoAssessmentRepository,
      IvfEmbryoTranferRepository,
      IvfICSIRepository,
      IvfTreatmentRepository,
      IvfSpermPrepRepository,
      PatientRepository,
      EmbryoTransRecordRepository,
      StaffRepository,
      CellInfoRepository,
      DayRecordsRepository,
      BiopsyRepository
    ]),
  ],
  controllers: [EmbryologyController],
  providers: [IvfEmbryologyService],
})
export class IvfEmbryologyModule {}
