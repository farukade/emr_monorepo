import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { appService } from './app.service';
import { HmoModule } from './modules/hmo/hmo.module';
import { HRModule } from './modules/hr/hr.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PatientModule } from './modules/patient/patient.module';
import { FinanceModule } from './modules/finance/finance.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { QueueSystemModule } from './modules/frontdesk/queue-system/queue-system.module';
import { FrontdeskModule } from './modules/frontdesk/frontdesk.module';
import { UtilityModule } from './modules/utility/utility.module';

import fs = require('fs');
import * as PostgressConnectionStringParser from 'pg-connection-string';
import { AuthModule } from './modules/auth/auth.module';
import { JwtStrategy } from './common/utils/jwt.strategy';
import { AppGateway } from './app.gateway';

fs.writeFileSync(
  './ormconfig.json',
  JSON.stringify(appService.getTypeOrmConfig(), null, 2),
);

@Module({
  imports: [
    TypeOrmModule.forRoot(appService.getTypeOrmConfig()),
    AuthModule,
    HmoModule,
    HRModule,
    PatientModule,
    FinanceModule,
    InventoryModule,
    QueueSystemModule,
    SettingsModule,
    FrontdeskModule,
    UtilityModule,
  ],
  controllers: [AppController],
  providers: [AppGateway, JwtStrategy],
})
export class AppModule {}
