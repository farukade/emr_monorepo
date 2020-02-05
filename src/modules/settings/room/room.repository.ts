import { EntityRepository, Repository } from 'typeorm';
import { Room } from '../entities/room.entity';
import { RoomDto } from './dto/room.dto';
import { RoomCategory } from '../entities/room_category.entity';

@EntityRepository(Room)
export class RoomRepository extends Repository<Room> {

    async createRoom(roomDto: RoomDto, category: RoomCategory): Promise<Room> {
        const { name, status } = roomDto;
        const room = new Room();
        room.name = name;
        room.status = status;
        room.category = category;
        await room.save();
        return room;
    }
}
