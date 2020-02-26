import { EntityRepository, Repository } from 'typeorm';
import { ConsultingRoomDto } from './dto/consulting-room.dto';
import { ConsultingRoom } from '../entities/consulting-room.entity';

@EntityRepository(ConsultingRoom)
export class ConsultingRoomRepository extends Repository<ConsultingRoom> {

    async saveConsultingRoom(consultingRoomDto: ConsultingRoomDto): Promise<ConsultingRoom> {
        const { name }  = consultingRoomDto;
        const consultingRoom  = new ConsultingRoom();
        consultingRoom.name   = name;
        await consultingRoom.save();
        return consultingRoom;
    }
}
