import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomDto } from './dto/room.dto';
import { RoomCategoryDto } from './dto/room.category.dto';
import { RoomCategory } from '../entities/room_category.entity';
import { Room } from '../entities/room.entity';
import { RoomCategoryRepository } from './room.category.repository';
import { RoomRepository } from './room.repository';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { Raw } from 'typeorm';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { ServiceCostRepository } from '../services/repositories/service_cost.repository';
import { formatPID } from '../../../common/utils/utils';
import { ServiceCost } from '../entities/service_cost.entity';
import { ServiceCategoryRepository } from '../services/repositories/service_category.repository';
import { ServiceRepository } from '../services/repositories/service.repository';

@Injectable()
export class RoomService {
    constructor(
        @InjectRepository(RoomRepository)
        private roomRepository: RoomRepository,
        @InjectRepository(RoomCategoryRepository)
        private roomCategoryRepository: RoomCategoryRepository,
        @InjectRepository(HmoSchemeRepository)
        private hmoSchemeRepository: HmoSchemeRepository,
        @InjectRepository(ServiceCostRepository)
        private serviceCostRepository: ServiceCostRepository,
        @InjectRepository(ServiceCategoryRepository)
        private serviceCategoryRepository: ServiceCategoryRepository,
        @InjectRepository(ServiceRepository)
        private serviceRepository: ServiceRepository,
    ) {
    }

    async getRoomsCategory(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { q, hmo_id } = params;

        const page = options.page - 1;

        const hmo = await this.hmoSchemeRepository.findOne(hmo_id);

        let where = {};

        if (q && q !== '') {
            where = { ...where, name: Raw(alias => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) };
        }

        const [result, total] = await this.roomCategoryRepository.findAndCount({
            where,
            order: { name: 'ASC' },
            take: options.limit,
            skip: (page * options.limit),
        });

        let rs = [];
        for (const item of result) {
            const service = await this.serviceCostRepository.findOne({ where: { code: item.code, hmo } });
            const rooms = await this.roomRepository.find({ where: { category: item } });

            rs = [...rs, { ...item, service, rooms, numRooms: rooms.length }];
        }

        return {
            result: rs,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page,
        };
    }

    async createRoomCategory(roomCategoryDto: RoomCategoryDto, username: string): Promise<any> {
        const { name, tariff } = roomCategoryDto;

        const serviceCategory = await this.serviceCategoryRepository.findOne({
            where: { slug: 'ward' },
        });
        const lastService = await this.serviceRepository.findOne({
            where: { category: serviceCategory },
            order: { code: 'DESC' },
        });

        const alphaCode = 'WR';
        let code;
        if (lastService) {
            const num = lastService.code.slice(2);
            const index = parseInt(num, 10) + 1;
            code = `${alphaCode.toLocaleUpperCase()}${formatPID(index, lastService.code.length - 2)}`;
        } else {
            code = `${alphaCode.toLocaleUpperCase()}${formatPID(1)}`;
        }

        const service = await this.serviceRepository.createService(roomCategoryDto, serviceCategory, code);

        const roomCategory = new RoomCategory();
        roomCategory.name = name;
        roomCategory.code = code;
        roomCategory.createdBy = username;
        const rs = await roomCategory.save();

        const schemes = await this.hmoSchemeRepository.find();

        for (const scheme of schemes) {
            const serviceCost = new ServiceCost();
            serviceCost.code = service.code;
            serviceCost.item = service;
            serviceCost.hmo = scheme;
            serviceCost.tariff = parseFloat(tariff);

            await serviceCost.save();
        }

        const hmo = await this.hmoSchemeRepository.findOne({
            where: { name: 'Private' },
        });

        const cost = await this.serviceCostRepository.findOne({
            where: { code: service.code, hmo },
        });

        return { ...rs, service: cost };
    }

    async updateRoomCategory(id: string, roomCategoryDto: RoomCategoryDto, username: string): Promise<any> {
        try {
            const { name, hmo_id } = roomCategoryDto;

            const hmo = await this.hmoSchemeRepository.findOne(hmo_id);
            const roomCategory = await this.roomCategoryRepository.findOne(id);

            const serviceCost = await this.serviceCostRepository.findOne({
                where: { code: roomCategory.code, hmo },
            });

            const service = await this.serviceRepository.findOne({
                where: { code: roomCategory.code },
            });
            service.name = name;
            service.lastChangedBy = username;
            await service.save();

            roomCategory.name = name;
            roomCategory.lastChangedBy = username;
            const query = await roomCategory.save();

            return { ...query, service: serviceCost };
        } catch (e) {
            throw new NotFoundException('could not update room category');
        }
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

    async getAllRooms(param): Promise<Room[]> {
        const { category_id } = param;

        let where = {};
        if (category_id && category_id !== '') {
            const category = await this.roomCategoryRepository.findOne(category_id);
            where = { ...where, category };
        }

        return this.roomRepository.find({
            where,
            relations: ['category'],
        });
    }

    async createRoom(roomDto: RoomDto, username: string): Promise<Room> {
        const { room_category_id } = roomDto;
        const category = await this.roomCategoryRepository.findOne(room_category_id);

        return this.roomRepository.createRoom(roomDto, category, username);
    }

    async updateRoom(id: string, roomDto: RoomDto, username: string): Promise<Room> {
        const { name, floor, room_category_id } = roomDto;
        const category = await this.roomCategoryRepository.findOne(room_category_id);

        const room = await this.roomRepository.findOne(id);
        room.name = name;
        room.floor = floor;
        room.category = category;
        room.lastChangedBy = username;

        return await room.save();
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
}
