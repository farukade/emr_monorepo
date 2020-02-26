import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { appService } from './app.service';
import { HmoModule } from './modules/hmo/hmo.module';
import { HRModule } from './modules/hr/hr.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PatientModule } from './modules/patient/patient.module';
import { ConsultationModule } from './modules/consultation/consultation.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ClinicalTasksModule } from './modules/clinical-tasks/clinical-tasks.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { QueueSystemModule } from './modules/frontdesk/queue-system/queue-system.module';
import { FrontdeskModule } from './modules/frontdesk/frontdesk.module';
import { UtilityModule } from './modules/utility/utility.module';

import fs = require('fs');
import * as PostgressConnectionStringParser from 'pg-connection-string';

fs.writeFileSync(
  './ormconfig.json',
  JSON.stringify(appService.getTypeOrmConfig(), null, 2),
);

@Module({
  imports: [
    TypeOrmModule.forRoot(appService.getTypeOrmConfig()),
    HmoModule,
    HRModule,
    PatientModule,
    ConsultationModule,
    FinanceModule,
    ClinicalTasksModule,
    InventoryModule,
    QueueSystemModule,
    SettingsModule,
    FrontdeskModule,
    UtilityModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
