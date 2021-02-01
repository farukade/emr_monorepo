import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomDto } from './dto/room.dto';
import { RoomCategoryDto } from './dto/room.category.dto';
import { RoomCategory } from '../entities/room_category.entity';
import { Room } from '../entities/room.entity';
import { RoomCategoryRepository } from './room.category.repository';
import { RoomRepository } from './room.repository';
import { getConnection } from 'typeorm';
import { Hmo } from '../../hmo/entities/hmo.entity';

@Injectable()
export class RoomService {
    constructor(
        @InjectRepository(RoomRepository)
        private roomRepository: RoomRepository,
        @InjectRepository(RoomCategoryRepository)
        private roomCategoryRepository: RoomCategoryRepository,
    ) {}

    async getAllRooms(): Promise<Room[]> {
        return this.roomRepository.find({relations: ['category']});
    }

    async getRoomById(id: string): Promise<Room> {
        const found = this.roomRepository.findOne(id);

        if (!found) {
            throw new NotFoundException(`Room with ID '${id}' not found`);
        }

        return found;
    }

    async createRoom(roomDto: RoomDto): Promise<Room> {
        const { room_category_id } = roomDto;
        let category;
        if (room_category_id) {
            category = await this.roomCategoryRepository.findOne(room_category_id);
        }
        return this.roomRepository.createRoom(roomDto, category);
    }

    async updateRoom(id: string, roomDto: RoomDto): Promise<Room> {
        const { name, status, room_category_id } = roomDto;
        const room = await this.getRoomById(id);
        const category = await this.roomCategoryRepository.findOne(room_category_id);
        room.name = name;
        room.status = status;
        room.category = category;
        await room.save();
        return room;
    }

    async deleteRoom(id: number, username: string): Promise<any> {
        const room = await this.roomRepository.findOne(id);

        if (!room) {
            throw new NotFoundException(`Room with ID '${id}' not found`);
        }

        room.deletedBy = username;
        await room.save();

        return room.softRemove();
    }

    /*
        ROOM CATEGORY SERVICES
    */
    async getRoomsCategory(hmo_id: number): Promise<RoomCategory[]> {
        if(hmo_id)
        {
             const query = this.roomCategoryRepository.createQueryBuilder('q')
            .innerJoin(Room, 'rooms', 'room.id = q.id')
            .select('q.id, q.name, q.price, q.discount, q.hmo_id')
            .addSelect('rooms.id as room_id, rooms.name as room_name')
            .where('q.hmo_id = :hmo_id', { hmo_id }).getMany();
            return query;
        }
        else
        {
            return this.roomCategoryRepository.find({relations: ['rooms', 'hmo']});
        }
        
    }

    async createRoomCategory(roomCategoryDto: RoomCategoryDto): Promise<RoomCategory> {
        return this.roomCategoryRepository.createCategory(roomCategoryDto);
    }

    async updateRoomCategory(id: string, roomCategoryDto: RoomCategoryDto): Promise<RoomCategory> {
        const { name, price, hmo_id, hmo_tarrif } = roomCategoryDto;
        const hmo = await getConnection().getRepository(Hmo).findOne(hmo_id);
        const category = await this.roomCategoryRepository.findOne(id);
        category.name = name;
        category.price = price;
        category.hmo = hmo;
        category.hmoTarrif = hmo_tarrif;
        await category.save();
        return category;
    }

    async deleteRoomCategory(id: number, username: string): Promise<any> {
        const category = await this.roomCategoryRepository.findOne(id);

        if (!category) {
            throw new NotFoundException(`Room category with ID '${id}' not found`);
        }

        category.deletedBy = username;
        await category.save();

        return category.softRemove();
    }
}
