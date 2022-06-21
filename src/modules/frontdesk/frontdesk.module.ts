import { Module } from '@nestjs/common';

import { AppointmentModule } from './appointment/appointment.module';
import { QueueSystemModule } from './queue-system/queue-system.module';
import { DoctorsAppointmentModule } from './doctors-apointment/appointment.module';

@Module({
  imports: [AppointmentModule, QueueSystemModule, DoctorsAppointmentModule],
  controllers: [],
})
export class FrontdeskModule {}
