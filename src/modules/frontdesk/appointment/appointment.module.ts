import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { AppointmentRepository } from './appointment.repository';

@Module({
  imports: [AppointmentRepository],
  controllers: [AppointmentController],
  providers: [AppointmentService]
})
export class AppointmentModule {}
