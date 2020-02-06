import { Module } from '@nestjs/common';
import { CafeteriaService } from './cafeteria.service';
import { CafeteriaController } from './cafeteria.controller';

@Module({
  providers: [CafeteriaService],
  controllers: [CafeteriaController]
})
export class CafeteriaModule {}
