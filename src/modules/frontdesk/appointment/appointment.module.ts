import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { AppointmentRepository } from './appointment.repository';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { SpecializationRepository } from '../../settings/specialization/specialization.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultingRoomRepository } from '../../settings/consulting-room/consulting-room.repository';

@Module({
  imports: [TypeOrmModule.forFeature([
    AppointmentRepository,
    PatientRepository,
    DepartmentRepository,
    SpecializationRepository,
    ConsultingRoomRepository,
  ])],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
