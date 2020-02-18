import { EntityRepository, Repository } from 'typeorm';
import { InventorySubCategoryDto } from './dto/inventory.sub-category.dto';
import { InventorySubCategory } from './entities/inventory.sub-category.entity';
import { InventoryCategory } from './entities/inventory.category.entity';

@EntityRepository(InventorySubCategory)
export class InventorySubCategoryRepository extends Repository<InventorySubCategory> {

    async saveCategory(inventorySubCategoryDto: InventorySubCategoryDto, category: InventoryCategory): Promise<InventorySubCategory> {
        const { name } = inventorySubCategoryDto;
        const subCategory = new InventorySubCategory();
        subCategory.name = name;
        subCategory.category = category;
        await subCategory.save();
        return subCategory;
    }
}
