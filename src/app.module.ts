import { CacheModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { configService } from './config.service';
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
import { QueueModule } from './modules/queue/queue.module';
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
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bull';
import { IvfEmbryologyModule } from './modules/patient/ivf/embryology/embryology.module';
import { EmbFreezingModule } from './modules/patient/ivf/freezing/freezing.module';

fs.writeFileSync('./ormconfig.json', JSON.stringify(configService.getTypeOrmConfig(), null, 2));

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
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
    BullModule.forRootAsync({
      useFactory: async () => ({
        defaultJobOptions: {
          removeOnComplete: true,
        },
        redis: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
        },
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
    QueueModule,
    LoggerModule,
    TasksModule,
    CafeteriaModule,
    ActivityModule,
    AccountingModule,
    ReportModule,
    MigrationModule,
    IvfEmbryologyModule,
    EmbFreezingModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway, JwtStrategy],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
