import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreInventoryRepository } from './store.repository';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';

@Module({
    imports: [TypeOrmModule.forFeature([StoreInventoryRepository])],
    providers: [StoreService],
    controllers: [StoreController],
})
export class StoreModule {}
