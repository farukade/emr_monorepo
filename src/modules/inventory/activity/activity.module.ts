import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryActivityRepository } from './activity.repository';
import { InventoryActivityService } from './activity.service';
import { InventoryActivityController } from './activity.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            InventoryActivityRepository,
        ]),
    ],
    providers: [InventoryActivityService],
    controllers: [InventoryActivityController],
})
export class InventoryActivityModule {
}
