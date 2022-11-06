import { EntityRepository, Repository } from 'typeorm';
import { DrugGeneric } from '../../entities/drug_generic.entity';

@EntityRepository(DrugGeneric)
export class DrugGenericRepository extends Repository<DrugGeneric> {}
