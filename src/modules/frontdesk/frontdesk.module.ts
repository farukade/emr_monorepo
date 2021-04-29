import {Module} from '@nestjs/common';

import {AppointmentModule} from './appointment/appointment.module';
import {QueueSystemModule} from './queue-system/queue-system.module';

@Module({
  imports: [
      AppointmentModule,
      QueueSystemModule,
    ],
  controllers: [],
})
export class FrontdeskModule {}
