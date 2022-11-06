import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRepository } from './repositories/chat.repository';
import { ChatGateway } from './chat.gateway';
import { StaffRepository } from '../hr/staff/staff.repository';
import { ChatGroupRepository } from './repositories/chat-room.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRepository,
      StaffRepository, 
      ChatGroupRepository
    ])
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway]
})
export class ChatModule {}
