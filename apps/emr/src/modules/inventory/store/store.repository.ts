import { EntityRepository, Repository } from 'typeorm';
import { StoreInventory } from '../entities/store_inventory.entity';

@EntityRepository(StoreInventory)
export class StoreInventoryRepository extends Repository<StoreInventory> {}
