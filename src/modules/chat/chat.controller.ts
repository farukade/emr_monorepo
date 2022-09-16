import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';

@UseGuards(AuthGuard('jwt'))
@Controller('messages/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get('')
  getChat(
    @Query() urlParams
  ) {
    return this.chatService.getChat(urlParams);
  }

  @Get('recipients')
  getRecipients(
    @Query() urlParams
  ) {
    return this.chatService.getRecipients(urlParams);
  }

  @Get('rooms')
  getRooms(
    @Query() urlParams
  ) {
    return this.chatService.getRooms(urlParams);
  }

  @Post('rooms/add')
  addRoom(
    @Body() data
  ) {
    return this.chatService.addRoom(data);
  }

  @Post('staffs/add-to-room')
  addToRoom(
    @Body() data
  ) {
    return this.chatService.addUserToGroup(data);
  }
}
