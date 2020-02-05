import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomRepository } from './room.repository';
import { RoomCategoryRepository } from './room.category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RoomRepository, RoomCategoryRepository])],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomsModule {}
