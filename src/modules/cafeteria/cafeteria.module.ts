import { Module } from '@nestjs/common';
import { CafeteriaService } from './cafeteria.service';
import { CafeteriaController } from './cafeteria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CafeteriaItemRepository } from './repositories/cafeteria.item.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        CafeteriaItemRepository,
    ])],
    providers: [CafeteriaService],
    controllers: [CafeteriaController],
})
export class CafeteriaModule {
}
