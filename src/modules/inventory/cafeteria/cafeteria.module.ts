import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CafeteriaInventoryRepository } from './cafeteria.repository';
import { CafeteriaInventoryController } from './cafeteria.controller';
import { CafeteriaInventoryService } from './cafeteria.service';
import { InventoryActivityRepository } from '../activity/activity.repository';
import { VendorRepository } from '../vendor/vendor.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
      CafeteriaInventoryRepository, InventoryActivityRepository, VendorRepository,
    ])],
    providers: [CafeteriaInventoryService],
    controllers: [CafeteriaInventoryController],
})
export class CafeteriaInventoryModule {}
