import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConsultingRoomRepository } from './consulting-room.repository';
import { ConsultingRoomDto } from './dto/consulting-room.dto';
import { ConsultingRoom } from '../entities/consulting-room.entity';
import { User } from '../../auth/entities/user.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';

@Injectable()
export class ConsultingRoomService {
    constructor(
        @InjectRepository(ConsultingRoomRepository)
        private consultingRoomRepository: ConsultingRoomRepository,
    ) {}
    async getConsultingRooms(): Promise<ConsultingRoom[]> {
        return await this.consultingRoomRepository.createQueryBuilder('q')
        .leftJoin(User, 'creator', 'q.createdBy = creator.username')
        // .innerJoin(User, 'updator', 'q.lastChangedBy = updator.username')
        .innerJoin(StaffDetails, 'staff1', 'staff1.user_id = creator.id')
        // .innerJoin(StaffDetails, 'staff2', 'staff2.user_id = updator.id')
        .select('q.id, q.name')
        .addSelect('CONCAT(staff1.first_name || \' \' || staff1.last_name) as created_by, staff1.id as created_by_id')
        // .addSelect('CONCAT(staff2.first_name || \' \' || staff2.last_name) as updated_by, staff2.id as updated_by_id')
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
