import { CacheModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { appService } from './app.service';
import { HmoModule } from './modules/hmo/hmo.module';
import { HRModule } from './modules/hr/hr.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PatientModule } from './modules/patient/patient.module';
import { FinanceModule } from './modules/finance/finance.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { FrontdeskModule } from './modules/frontdesk/frontdesk.module';
import { UtilityModule } from './modules/utility/utility.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtStrategy } from './common/utils/jwt.strategy';
import { AppGateway } from './app.gateway';
import { MailModule } from './modules/mail/mail.module';
import { LoggerModule } from './modules/logger/logger.module';
import { TasksModule } from './modules/scheduler/cron.module';
import { CafeteriaModule } from './modules/cafeteria/cafeteria.module';
import { ActivityModule } from './modules/activity/activity.module';

import fs = require('fs');
import { AccountingModule } from './modules/accounting/accounting.module';
import { ReportModule } from './modules/report/report.module';
import { MigrationModule } from './modules/migration/migration.module';
import * as redisStore from 'cache-manager-redis-store';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';

fs.writeFileSync(
    './ormconfig.json',
    JSON.stringify(appService.getTypeOrmConfig(), null, 2),
);

@Module({
    imports: [
        TypeOrmModule.forRoot(appService.getTypeOrmConfig()),
        ScheduleModule.forRoot(),
        CacheModule.registerAsync({
            imports: [],
            inject: [],
            useFactory: async () => ({
                store: redisStore,
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                ttl: 120,
            }),
        }),
        AuthModule,
        HmoModule,
        HRModule,
        PatientModule,
        FinanceModule,
        InventoryModule,
        SettingsModule,
        FrontdeskModule,
        UtilityModule,
        MailModule,
        LoggerModule,
        TasksModule,
        CafeteriaModule,
        ActivityModule,
        AccountingModule,
        ReportModule,
        MigrationModule,
    ],
    controllers: [AppController],
    providers: [AppGateway, JwtStrategy],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(RequestLoggerMiddleware).forRoutes('*');
    }
}
