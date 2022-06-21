import { EntityRepository, Repository } from 'typeorm';
import { Drug } from '../../entities/drug.entity';

@EntityRepository(Drug)
export class DrugRepository extends Repository<Drug> {}
