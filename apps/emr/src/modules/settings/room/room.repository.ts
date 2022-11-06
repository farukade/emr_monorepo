import { EntityRepository, Repository } from 'typeorm';
import { Room } from '../entities/room.entity';
import { RoomDto } from './dto/room.dto';
import { RoomCategory } from '../entities/room_category.entity';

@EntityRepository(Room)
export class RoomRepository extends Repository<Room> {
  async createRoom(roomDto: RoomDto, category: RoomCategory, username): Promise<Room> {
    const { name, floor } = roomDto;
    const room = new Room();
    room.name = name;
    room.floor = floor;
    room.status = 'Not Occupied';
    room.category = category;
    room.createdBy = username;
    await room.save();
    return room;
  }
}
