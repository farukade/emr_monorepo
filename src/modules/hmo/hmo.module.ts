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

@Module({
  imports: [TypeOrmModule.forFeature([
    HmoRepository,
    HmoRateRepository,
    ServiceRepository,
    StockRepository,
    TransactionsRepository,
    QueueSystemRepository,
  ])],
  controllers: [HmoController],
  providers: [AppGateway, HmoService],
})
export class HmoModule {}
