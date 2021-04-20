import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsumableService } from './consumable.service';
import { ConsumableRepository } from './consumable.repository';
import { ConsumableController } from './consumable.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConsumableRepository])],
  controllers: [ConsumableController],
  providers: [ConsumableService],
})
export class ConsumableModule {}
