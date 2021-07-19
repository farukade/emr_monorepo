import { EntityRepository, Repository } from 'typeorm';
import { CafeteriaInventory } from '../entities/cafeteria_inventory.entity';

@EntityRepository(CafeteriaInventory)
export class CafeteriaInventoryRepository extends Repository<CafeteriaInventory> {
}
