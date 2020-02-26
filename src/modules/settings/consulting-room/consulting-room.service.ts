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
        return this.consultingRoomRepository.find();
    }

    async createConsultingRoom(consultingRoomDto: ConsultingRoomDto): Promise<ConsultingRoom> {
        return this.consultingRoomRepository.saveConsultingRoom(ConsultingRoomDto);
    }

    async updateConsultingRoom(id: string, consultingRoomDto: ConsultingRoomDto): Promise<ConsultingRoom> {
        const { name } = consultingRoomDto;
        const consultingRoom = await this.consultingRoomRepository.findOne(id);
        consultingRoom.name = name;
        await consultingRoom.save();
        return consultingRoom;
    }

    async deleteConsultingRoom(id: string): Promise<void> {
        const result = await this.consultingRoomRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Consulting Room with ID '${id}' not found`);
        }
    }
}
