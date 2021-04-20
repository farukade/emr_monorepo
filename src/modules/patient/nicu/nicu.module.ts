import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NicuService } from './nicu.service';
import { NicuController } from './nicu.controller'
import { NicuRepository } from './nicu.repository'
import { PatientRepository } from '../repositories/patient.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NicuRepository, PatientRepository, StaffRepository])],
  controllers: [NicuController],
  providers: [NicuService],
})
export class NicuModule {}
