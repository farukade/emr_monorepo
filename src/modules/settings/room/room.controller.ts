import { Controller, Get, Post, Patch, UsePipes, ValidationPipe, Body, Param, Delete } from '@nestjs/common';
import { RoomService } from './room.service';
import { Room } from '../entities/room.entity';
import { RoomCategory } from '../entities/room_category.entity';
import { RoomDto } from './dto/room.dto';
import { RoomCategoryDto } from './dto/room.category.dto';

@Controller('rooms')
export class RoomController {
    constructor(private roomService: RoomService) {}

    @Get()
    getRooms(): Promise<Room[]> {
        return this.roomService.getAllRooms();
    }

    @Post()
    @UsePipes(ValidationPipe)
    createRoom(@Body() roomDto: RoomDto): Promise<Room> {
        return this.roomService.createRoom(roomDto);
    }

    @Patch('/:id/update')
    @UsePipes(ValidationPipe)
    updateRoom(
        @Param('id') id: string,
        @Body() roomDto: RoomDto,
    ): Promise<Room> {
        return this.roomService.updateRoom(id, roomDto);
    }

    @Delete('/:id')
    deleteRoom(@Param('id') id: string): Promise<void> {
        return this.roomService.deleteRoom(id);
    }

    @Get('/categories')
    getCategories(): Promise<RoomCategory[]> {
        return this.roomService.getRoomsCategory();
    }

    @Post('/categories')
    @UsePipes(ValidationPipe)
    createRoomCategory(@Body() roomCategoryDto: RoomCategoryDto): Promise<RoomCategory> {
        return this.roomService.createRoomCategory(roomCategoryDto);
    }

    @Patch('categories/:id/update')
    @UsePipes(ValidationPipe)
    updateCategory(
        @Param('id') id: string,
        @Body() roomCategoryDto: RoomCategoryDto,
    ): Promise<RoomCategory> {
        return this.roomService.updateRoomCategory(id, roomCategoryDto);
    }

    @Delete('categories/:id')
    deleteRoomCategory(@Param('id') id: string): Promise<void> {
        return this.roomService.deleteRoomCategory(id);
    }
}
