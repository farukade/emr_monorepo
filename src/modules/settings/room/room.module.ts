import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomRepository } from './room.repository';
import { RoomCategoryRepository } from './room.category.repository';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { ServiceCostRepository } from '../services/repositories/service_cost.repository';
import { ServiceCategoryRepository } from '../services/repositories/service_category.repository';
import { ServiceRepository } from '../services/repositories/service.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            RoomRepository,
            RoomCategoryRepository,
            HmoSchemeRepository,
            ServiceCostRepository,
            ServiceCategoryRepository,
            ServiceRepository,
        ]),
    ],
    controllers: [RoomController],
    providers: [RoomService],
})
export class RoomsModule {
}
