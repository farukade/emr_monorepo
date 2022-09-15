import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRepository } from './chat.repository';
import { ChatGateway } from './chat.gateway';
import { StaffRepository } from '../hr/staff/staff.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRepository,
      StaffRepository
    ])
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway]
})
export class ChatModule {}
