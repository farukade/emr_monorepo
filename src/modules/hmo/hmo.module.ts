import { Module } from '@nestjs/common';
import { HmoController } from './hmo.controller';
import { HmoService } from './hmo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HmoRepository } from './hmo.repository';
import { ServiceRepository } from '../settings/services/service.repository';
import { StockRepository } from '../inventory/stock.repository';
import { HmoRateRepository } from './hmo-rate.repository';
import { TransactionsRepository } from '../finance/transactions/transactions.repository';
import { QueueSystemRepository } from '../frontdesk/queue-system/queue-system.repository';
import { AppGateway } from '../../app.gateway';
import { PatientRepository } from '../patient/repositories/patient.repository';
import { ServiceCategoryRepository } from '../settings/services/service.category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([
    HmoRepository,
    HmoRateRepository,
    ServiceRepository,
    StockRepository,
    TransactionsRepository,
    QueueSystemRepository,
    PatientRepository,
    ServiceCategoryRepository,
  ])],
  controllers: [HmoController],
  providers: [AppGateway, HmoService],
})
export class HmoModule {}
