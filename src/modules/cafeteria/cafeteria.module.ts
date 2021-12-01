import { Module } from '@nestjs/common';
import { CafeteriaService } from './cafeteria.service';
import { CafeteriaController } from './cafeteria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CafeteriaItemRepository } from './repositories/cafeteria.item.repository';
import { CafeteriaFoodItemRepository } from './repositories/cafeteria.food-item.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        CafeteriaItemRepository,
        CafeteriaFoodItemRepository,
    ])],
    providers: [CafeteriaService],
    controllers: [CafeteriaController],
})
export class CafeteriaModule {
}
