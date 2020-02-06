import { Module } from '@nestjs/common';
import { HmoController } from './hmo.controller';
import { HmoService } from './hmo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HmoRepository } from './hmo.repository';

@Module({
  imports: [TypeOrmModule.forFeature([HmoRepository])],
  controllers: [HmoController],
  providers: [HmoService],
})
export class HmoModule {}
