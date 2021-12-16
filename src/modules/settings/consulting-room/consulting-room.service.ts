import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConsultingRoomRepository } from './consulting-room.repository';
import { ConsultingRoomDto } from './dto/consulting-room.dto';
import { ConsultingRoom } from '../entities/consulting-room.entity';

@Injectable()
export class ConsultingRoomService {
    constructor(
        @InjectRepository(ConsultingRoomRepository)
        private consultingRoomRepository: ConsultingRoomRepository,
    ) {}

    async getConsultingRooms(): Promise<ConsultingRoom[]> {
        return await this.consultingRoomRepository.createQueryBuilder('q')
            .select('q.*')
            .getRawMany();
    }

    async createConsultingRoom(consultingRoomDto: ConsultingRoomDto, createdBy: string): Promise<ConsultingRoom> {
        return this.consultingRoomRepository.saveConsultingRoom(consultingRoomDto, createdBy);
    }

    async updateConsultingRoom(id: string, consultingRoomDto: ConsultingRoomDto, updatedBy): Promise<ConsultingRoom> {
        const { name } = consultingRoomDto;
        const consultingRoom = await this.consultingRoomRepository.findOne(id);
        consultingRoom.name = name;
        consultingRoom.lastChangedBy = updatedBy;
        await consultingRoom.save();
        return consultingRoom;
    }

    async deleteConsultingRoom(id: string): Promise<any> {
        const result = await this.consultingRoomRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Consulting Room with ID '${id}' not found`);
        } else {
            return result;
        }
    }
}
