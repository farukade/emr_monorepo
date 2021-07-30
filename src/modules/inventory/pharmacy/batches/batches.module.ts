import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugBatchRepository } from './batches.repository';
import { DrugBatchController } from './batches.controller';
import { DrugBatchService } from './batches.service';
import { VendorRepository } from '../../vendor/vendor.repository';
import { DrugRepository } from '../drug/drug.repository';
import { InventoryActivityRepository } from '../../activity/activity.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            DrugBatchRepository,
            VendorRepository,
            DrugRepository,
            InventoryActivityRepository,
        ]),
    ],
    providers: [DrugBatchService],
    controllers: [DrugBatchController],
})
export class BatchesModule {
}
