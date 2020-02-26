import { Controller, Get, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConsultingRoomService } from './consulting-room.service';
import { ConsultingRoom } from '../entities/consulting-room.entity';
import { ConsultingRoomDto } from './dto/consulting-room.dto';

@Controller('consulting-rooms')
export class ConsultingRoomController {
    constructor(private consultingRoomService: ConsultingRoomService) {}

    @Get()
    getConsultingRoom(): Promise<ConsultingRoom[]> {
        return this.consultingRoomService.getConsultingRooms();
    }

    @Post()
    @UsePipes(ValidationPipe)
    createConsultingRoom(@Body() consultingRoomDto: ConsultingRoomDto): Promise<ConsultingRoom> {
        return this.consultingRoomService.createConsultingRoom(consultingRoomDto);
    }

    @Patch('/:id/update')
    @UsePipes(ValidationPipe)
    updateConsultingRoom(
        @Param('id') id: string,
        @Body() consultingRoomDto: ConsultingRoomDto,
    ): Promise<ConsultingRoom> {
        return this.consultingRoomService.updateConsultingRoom(id, consultingRoomDto);
    }

    @Delete('/:id')
    deleteConsultingRoom(@Param('id') id: string): Promise<void> {
        return this.consultingRoomService.deleteConsultingRoom(id);
    }
}
