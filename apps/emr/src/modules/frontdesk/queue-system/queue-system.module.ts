import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppGateway } from '../../../app.gateway';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { AppointmentRepository } from '../appointment/appointment.repository';

import { QueueSystemController } from './queue-system.controller';
import { QueueSystemRepository } from './queue-system.repository';
import { QueueSystemService } from './queue-system.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentRepository, PatientRepository, QueueSystemRepository, DepartmentRepository]),
  ],
  controllers: [QueueSystemController],
  providers: [AppGateway, QueueSystemService],
})
export class QueueSystemModule {}
