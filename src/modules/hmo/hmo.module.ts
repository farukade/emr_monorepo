import { Module } from '@nestjs/common';
import { HmoController } from './hmo.controller';
import { HmoService } from './hmo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HmoRepository } from './hmo.repository';
import { ServiceRepository } from '../settings/services/service.repository';
import { StockRepository } from '../inventory/stock.repository';
import { HmoRateRepository } from './hmo-rate.repository';

@Module({
  imports: [TypeOrmModule.forFeature([HmoRepository, HmoRateRepository, ServiceRepository, StockRepository])],
  controllers: [HmoController],
  providers: [HmoService],
})
export class HmoModule {}
