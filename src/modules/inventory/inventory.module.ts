import { Module } from '@nestjs/common';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { CafeteriaModule } from './cafeteria/cafeteria.module';
import { StoreModule } from './store/store.module';
import { ProcurementModule } from './procurement/procurement.module';
import { ProcedureTheaterModule } from './procedure-theater/procedure-theater.module';
import { PosModule } from './pos/pos.module';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryCategoryRepository } from './inventory.category.repository';
import { InventorySubCategoryRepository } from './inventory.sub-category.repository';
import { StockRepository } from './stock.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryCategoryRepository, InventorySubCategoryRepository, StockRepository]),
    PharmacyModule,
    CafeteriaModule,
    StoreModule,
    ProcurementModule,
    ProcedureTheaterModule,
    PosModule],
  providers: [InventoryService],
  controllers: [InventoryController],
})
export class InventoryModule {}
