import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomRepository } from './room.repository';
import { RoomCategoryRepository } from './room.category.repository';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        RoomRepository,
        RoomCategoryRepository,
        HmoSchemeRepository,
    ])],
    controllers: [RoomController],
    providers: [RoomService],
})
export class RoomsModule {
}
