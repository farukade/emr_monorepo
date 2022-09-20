import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('messages/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('')
  getChat(
    @Query() urlParams
  ) {
    return this.chatService.getChat(urlParams);
  }
}
