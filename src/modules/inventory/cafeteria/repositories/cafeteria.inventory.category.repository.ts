import { EntityRepository, Repository } from 'typeorm';
import { CafeteriaInventoryCategory } from '../entities/cafeteria_inventory_category.entity';

@EntityRepository(CafeteriaInventoryCategory)
export class CafeteriaInventoryCategoryRepository extends Repository<CafeteriaInventoryCategory> {

}
