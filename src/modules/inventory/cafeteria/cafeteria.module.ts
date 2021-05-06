import { Module } from '@nestjs/common';
import { CafeteriaService } from './cafeteria.service';
import { CafeteriaController } from './cafeteria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CafeteriaInventoryRepository } from './repositories/cafeteria.inventory.repository';
import { CafeteriaItemRepository } from './repositories/cafeteria.item.repository';
import { CafeteriaItemCategoryRepository } from './repositories/cafeteria.item.category.repository';
import { CafeteriaInventoryCategoryRepository } from './repositories/cafeteria.inventory.category.repository';
import { StockRepository } from '../stock.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        CafeteriaInventoryRepository,
        CafeteriaItemRepository,
        CafeteriaItemCategoryRepository,
        CafeteriaInventoryCategoryRepository,
        StockRepository,
    ])],
    providers: [CafeteriaService],
    controllers: [CafeteriaController],
})
export class CafeteriaModule {
}
