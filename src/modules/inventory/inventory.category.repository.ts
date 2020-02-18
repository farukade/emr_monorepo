import { EntityRepository, Repository } from 'typeorm';
import { InventoryCategoryDto } from './dto/inventory.category.dto';
import { InventoryCategory } from './entities/inventory.category.entity';

@EntityRepository(InventoryCategory)
export class InventoryCategoryRepository extends Repository<InventoryCategory> {

    async saveCategory(inventoryCategoryDto: InventoryCategoryDto): Promise<InventoryCategory> {
        const { name } = inventoryCategoryDto;
        const category = new InventoryCategory();
        category.name = name;
        await category.save();
        return category;
    }
}
