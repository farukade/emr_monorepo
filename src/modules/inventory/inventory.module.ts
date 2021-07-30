import { Module } from '@nestjs/common';
import { VendorModule } from './vendor/vendor.module';
import { StoreModule } from './store/store.module';
import { RequisitionModule } from './requisition/requisition.module';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { CafeteriaInventoryModule } from './cafeteria/cafeteria.module';
import { BatchesModule } from './pharmacy/batches/batches.module';
import { GenericModule } from './pharmacy/generic/generic.module';
import { DrugModule } from './pharmacy/drug/drug.module';
import { InventoryActivityModule } from './activity/activity.module';

@Module({
    imports: [
        VendorModule,
        ManufacturerModule,
        RequisitionModule,
        StoreModule,
        CafeteriaInventoryModule,
        BatchesModule,
        GenericModule,
        DrugModule,
        InventoryActivityModule,
    ],
    providers: [],
    controllers: [],
})
export class InventoryModule {
}
