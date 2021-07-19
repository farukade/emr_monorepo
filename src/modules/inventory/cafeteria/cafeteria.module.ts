import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CafeteriaInventoryRepository } from './cafeteria.repository';
import { CafeteriaInventoryController } from './cafeteria.controller';
import { CafeteriaInventoryService } from './cafeteria.service';

@Module({
    imports: [TypeOrmModule.forFeature([CafeteriaInventoryRepository])],
    providers: [CafeteriaInventoryService],
    controllers: [CafeteriaInventoryController],
})
export class CafeteriaInventoryModule {}
