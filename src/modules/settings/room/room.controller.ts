import {
  Controller,
  Get,
  Post,
  Patch,
  UsePipes,
  ValidationPipe,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { Room } from '../entities/room.entity';
import { RoomDto } from './dto/room.dto';
import { RoomCategoryDto } from './dto/room.category.dto';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get('/categories')
  getCategories(@Request() request, @Query() urlParams): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 30;
    const page = request.query.hasOwnProperty('page') ? request.query.page : 1;

    return this.roomService.getRoomsCategory({ page, limit }, urlParams);
  }

  @Post('/categories')
  @UsePipes(ValidationPipe)
  createRoomCategory(@Body() roomCategoryDto: RoomCategoryDto, @Request() req): Promise<any> {
    return this.roomService.createRoomCategory(roomCategoryDto, req.user.username);
  }

  @Patch('categories/:id')
  @UsePipes(ValidationPipe)
  updateCategory(@Param('id') id: string, @Body() roomCategoryDto: RoomCategoryDto, @Request() req): Promise<any> {
    return this.roomService.updateRoomCategory(id, roomCategoryDto, req.user.username);
  }

  @Delete('categories/:id')
  deleteRoomCategory(@Param('id') id: number, @Request() req): Promise<any> {
    return this.roomService.deleteRoomCategory(id, req.user.username);
  }

  @Get('')
  getRooms(@Query() urlParams): Promise<Room[]> {
    return this.roomService.getAllRooms(urlParams);
  }

  @Post('')
  @UsePipes(ValidationPipe)
  createRoom(@Body() roomDto: RoomDto, @Request() req): Promise<Room> {
    return this.roomService.createRoom(roomDto, req.user.username);
  }

  @Patch('/:id')
  @UsePipes(ValidationPipe)
  updateRoom(@Param('id') id: string, @Body() roomDto: RoomDto, @Request() req): Promise<Room> {
    return this.roomService.updateRoom(id, roomDto, req.user.username);
  }

  @Delete('/:id')
  deleteRoom(@Param('id') id: number, @Request() req): Promise<any> {
    return this.roomService.deleteRoom(id, req.user.username);
  }
}
