import { Module } from '@nestjs/common';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientRepository } from './repositories/patient.repository';
import { PatientNOKRepository } from './repositories/patient.nok.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PatientRepository, PatientNOKRepository])],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}
