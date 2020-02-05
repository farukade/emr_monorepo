import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomDto } from './dto/room.dto';
import { RoomCategoryDto } from './dto/room.category.dto';
import { RoomCategory } from '../entities/room_category.entity';
import { Room } from '../entities/room.entity';
import { RoomCategoryRepository } from './room.category.repository';
import { RoomRepository } from './room.repository';

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

    async deleteRoom(id: string): Promise<void> {
        const result = await this.roomRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Room with ID '${id}' not found`);
        }
    }

    /*
        ROOM CATEGORY SERVICES
    */

    async getRoomsCategory(): Promise<RoomCategory[]> {
        return this.roomCategoryRepository.find({relations: ['rooms']});
    }

    async createRoomCategory(roomCategoryDto: RoomCategoryDto): Promise<RoomCategory> {
        return this.roomCategoryRepository.createCategory(roomCategoryDto);
    }

    async updateRoomCategory(id: string, roomCategoryDto: RoomCategoryDto): Promise<RoomCategory> {
        const { name, price, discount } = roomCategoryDto;
        const category = await this.roomCategoryRepository.findOne(id);
        category.name = name;
        category.price = price;
        category.discount = discount;
        await category.save();
        return category;
    }

    async deleteRoomCategory(id: string): Promise<void> {
        const result = await this.roomCategoryRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Room category with ID '${id}' not found`);
        }
    }
}
