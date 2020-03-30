import { Module } from '@nestjs/common';
import { CafeteriaService } from './cafeteria.service';
import { CafeteriaController } from './cafeteria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CafeteriaInventoryRepository } from './repositories/cafeteria.inventory.repository';
import { CafeteriaItemRepository } from './repositories/cafeteria.item.repository';
import { CafeteriaItemCategoryRepository } from './repositories/cafeteria.item.category.repository';
import { CafeteriaInventoryCategoryRepository } from './repositories/cafeteria.inventory.category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([
    CafeteriaInventoryRepository,
    CafeteriaItemRepository,
    CafeteriaItemCategoryRepository,
    CafeteriaInventoryCategoryRepository,
  ])],
  providers: [CafeteriaService],
  controllers: [CafeteriaController],
})
export class CafeteriaModule {}
