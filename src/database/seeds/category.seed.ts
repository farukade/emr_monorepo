import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { InventoryCategory } from '../../modules/inventory/entities/inventory.category.entity';
import { slugify } from '../../common/utils/utils';

export default class SetCategorySeed implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        const categories = [
            { name: 'Pharmacy' },
            { name: 'Cafeteria' },
        ];

        for (const c of categories) {
            const category = new InventoryCategory();
            category.name = c.name;
            category.slug = slugify(c.name);
            await category.save();
        }
    }
}
