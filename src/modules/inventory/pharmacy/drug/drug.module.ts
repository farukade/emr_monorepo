import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugService } from './drug.service';
import { DrugController } from './drug.controller';
import { DrugRepository } from './drug.repository';
import { DrugBatchRepository } from '../batches/batches.repository';
import { DrugGenericRepository } from '../generic/generic.repository';
import { ManufacturerRepository } from '../../manufacturer/manufacturer.repository';
import { ServiceRepository } from '../../../settings/services/repositories/service.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            DrugRepository,
            DrugBatchRepository,
            DrugGenericRepository,
            ManufacturerRepository,
            ServiceRepository,
        ]),
    ],
    providers: [DrugService],
    controllers: [DrugController],
})
export class DrugModule {
}
