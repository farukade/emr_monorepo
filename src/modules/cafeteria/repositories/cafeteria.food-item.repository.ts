import { EntityRepository, Repository } from 'typeorm';
import { CafeteriaFoodItem } from '../entities/food_item.entity';

@EntityRepository(CafeteriaFoodItem)
export class CafeteriaFoodItemRepository extends Repository<CafeteriaFoodItem> {
}
