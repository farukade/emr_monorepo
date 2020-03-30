import { EntityRepository, Repository } from 'typeorm';
import { CafeteriaItemCategory } from '../entities/cafeteria_item_category.entity';

@EntityRepository(CafeteriaItemCategory)
export class CafeteriaItemCategoryRepository extends Repository<CafeteriaItemCategory> {

}
