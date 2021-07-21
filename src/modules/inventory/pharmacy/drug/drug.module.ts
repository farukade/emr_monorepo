import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugService } from './drug.service';
import { DrugController } from './drug.controller';
import { DrugRepository } from './drug.repository';
import { DrugBatchRepository } from '../batches/batches.repository';
import { DrugGenericRepository } from '../generic/generic.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            DrugRepository,
            DrugBatchRepository,
            DrugGenericRepository,
        ]),
    ],
    providers: [DrugService],
    controllers: [DrugController],
})
export class DrugModule {
}
