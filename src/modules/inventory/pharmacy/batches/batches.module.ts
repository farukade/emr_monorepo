import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugBatchRepository } from './batches.repository';
import { DrugBatchController } from './batches.controller';
import { DrugBatchService } from './batches.service';

@Module({
    imports: [TypeOrmModule.forFeature([DrugBatchRepository])],
    providers: [DrugBatchService],
    controllers: [DrugBatchController],
})
export class BatchesModule {}
