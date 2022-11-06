import { EntityRepository, Repository } from 'typeorm';
import { ConsultingRoomDto } from './dto/consulting-room.dto';
import { ConsultingRoom } from '../entities/consulting-room.entity';

@EntityRepository(ConsultingRoom)
export class ConsultingRoomRepository extends Repository<ConsultingRoom> {
  async saveConsultingRoom(roomDto: ConsultingRoomDto, createdBy: string): Promise<ConsultingRoom> {
    const { name } = roomDto;

    const consultingRoom = new ConsultingRoom();
    consultingRoom.name = name;
    consultingRoom.createdBy = createdBy;
    await consultingRoom.save();

    return consultingRoom;
  }
}
