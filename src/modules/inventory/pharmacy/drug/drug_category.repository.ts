import { EntityRepository, Repository } from 'typeorm';
import { Drug } from '../../entities/drug.entity';
import { DrugCategory } from '../../entities/drug_category.entity';

@EntityRepository(DrugCategory)
export class DrugCategoryRepository extends Repository<DrugCategory> {
}
