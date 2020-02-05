import { Module } from '@nestjs/common';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { CafeteriaModule } from './cafeteria/cafeteria.module';
import { StoreModule } from './store/store.module';
import { ProcurementModule } from './procurement/procurement.module';
import { ProcedureTheaterModule } from './procedure-theater/procedure-theater.module';
import { PosModule } from './pos/pos.module';

@Module({
  imports: [PharmacyModule, CafeteriaModule, StoreModule, ProcurementModule, ProcedureTheaterModule, PosModule]
})
export class InventoryModule {}
