import {
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ConsultingRoomService } from './consulting-room.service';
import { ConsultingRoom } from '../entities/consulting-room.entity';
import { ConsultingRoomDto } from './dto/consulting-room.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('consulting-rooms')
export class ConsultingRoomController {
  constructor(private consultingRoomService: ConsultingRoomService) {}

  @Get()
  getConsultingRoom(): Promise<ConsultingRoom[]> {
    return this.consultingRoomService.getConsultingRooms();
  }

  @Post()
  @UsePipes(ValidationPipe)
  createConsultingRoom(@Body() consultingRoomDto: ConsultingRoomDto, @Request() req): Promise<ConsultingRoom> {
    return this.consultingRoomService.createConsultingRoom(consultingRoomDto, req.user.username);
  }

  @Patch('/:id')
  @UsePipes(ValidationPipe)
  updateConsultingRoom(
    @Param('id') id: string,
    @Body() consultingRoomDto: ConsultingRoomDto,
    @Request() req,
  ): Promise<ConsultingRoom> {
    return this.consultingRoomService.updateConsultingRoom(id, consultingRoomDto, req.user.username);
  }

  @Delete('/:id')
  deleteConsultingRoom(@Param('id') id: string, @Request() req): Promise<any> {
    return this.consultingRoomService.deleteConsultingRoom(id, req.user.username);
  }
}
