import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConsultingRoomRepository } from './consulting-room.repository';
import { ConsultingRoomDto } from './dto/consulting-room.dto';
import { ConsultingRoom } from '../entities/consulting-room.entity';

@Injectable()
export class ConsultingRoomService {
  constructor(
    @InjectRepository(ConsultingRoomRepository)
    private consultingRepository: ConsultingRoomRepository,
  ) {}

  async getConsultingRooms(): Promise<ConsultingRoom[]> {
    return await this.consultingRepository.createQueryBuilder('q').select('q.*').getRawMany();
  }

  async createConsultingRoom(roomDto: ConsultingRoomDto, createdBy: string): Promise<ConsultingRoom> {
    return this.consultingRepository.saveConsultingRoom(roomDto, createdBy);
  }

  async updateConsultingRoom(id: string, roomDto: ConsultingRoomDto, updatedBy: string): Promise<ConsultingRoom> {
    const { name } = roomDto;

    const room = await this.consultingRepository.findOne(id);
    room.name = name;
    room.lastChangedBy = updatedBy;
    await room.save();

    return room;
  }

  async deleteConsultingRoom(id: string, username: string): Promise<any> {
    const room = await this.consultingRepository.findOne(id);

    if (!room) {
      throw new NotFoundException(`Consulting Room with ID '${id}' not found`);
    }

    room.deletedBy = username;
    await room.save();

    return room.softRemove();
  }
}
