import { EntityRepository, Repository } from 'typeorm';
import { DrugBatch } from '../../entities/batches.entity';

@EntityRepository(DrugBatch)
export class DrugBatchRepository extends Repository<DrugBatch> {
}
