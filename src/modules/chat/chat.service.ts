import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getChatRoomId } from 'src/common/utils/utils';
import { AuthRepository } from '../auth/auth.repository';
import { ChatRepository } from './chat.repository';
import { ChatDto } from './dto/chat.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ChatEntity } from './entities/chat.entity';
const { log } = console;

@Injectable()
export class ChatService {

  constructor(
    @InjectRepository(ChatRepository)
    private chatRepository: ChatRepository,
    @InjectRepository(AuthRepository)
    private userRepository: AuthRepository,
  ) { }

  async saveChat(data: ChatDto, chat_id: string, room_id: string) {
    try {

      const recipient = await this.userRepository.findOne(+data.recipient_id);
      const sender = await this.userRepository.findOne(+data.sender_id);

      if (!sender || !recipient)
        return { success: false, message: "sender | receiver not found" };

      const chat = this.chatRepository.create({
        ...data,
        chat_id,
        room_id
      });

      await this.chatRepository.save(chat);

      return { success: true, message: chat };

    } catch (error) {
      log(error);
      return { success: false, message: error.message || "an error occurred" };
    }
  }

  async getChat(params) {
    try {
      const { room_id, sender_id, recipient_id, page } = params;

      const skip = +page - 1;
      const limit = +params.limit;

      let recipient;
      if (recipient_id) {
        recipient = await this.userRepository.findOne(+recipient_id);
      };

      let sender;
      if (sender_id) {
        sender = await this.userRepository.findOne(+sender_id);
      }

      let chat_id: string;
      if ((sender_id && sender_id != "") && (recipient_id && recipient_id != "")) {
        chat_id = getChatRoomId([+sender_id, +recipient_id]);
      }

      const query = this.chatRepository.createQueryBuilder('c');

      if (chat_id) {
        query.andWhere('c.chat_id = :chat_id', { chat_id });
      } else if (room_id) {
        query.andWhere('c.room_id = :room_id', { room_id });
      };

      const total = await query.getCount();

      const result = await query
        .orderBy('c.createdAt', 'DESC')
        .take(limit)
        .skip(skip)
        .getMany();

      return {
        success: true,
        lastPage: Math.ceil(total / limit),
        itemsPerPage: limit,
        totalItems: total,
        currentPage: page,
        sender,
        recipient,
        result,
      };

    } catch (error) {
      log(error);
      return { success: false, message: error.message || "an error occurred" };
    }
  }

  async deleteChat(id, sender_id) {
    try {
      const chat = await this.chatRepository.findOne({
        where: {
          id,
          sender_id
        }
      });

      if (!chat)
        return { success: false, message: "chat not found" };

      const response = await this.chatRepository
        .createQueryBuilder()
        .delete()
        .from(ChatEntity)
        .where('id = :id', { id })
        .execute();

      if (response.affected) {
        return { success: true, message: "delete success" };
      };

      return { success: false, message: "delete failed" };

    } catch (error) {
      log(error);
      return { success: false, message: error.message || "an error occurred" };
    }
  }

  async getRecipients(params) {
    try {
      const { sender_id } = params;
      const recipient = await this.chatRepository.createQueryBuilder('c')
        .where('c.sender_id = :sender_id', { sender_id })
        .select('c.recipient_id as recipient')
        .groupBy('c.recipient_id')
        .getRawMany();

      let recipients = [];
      for (const item of recipient) {
        let user = await this.userRepository.findOne(item.recipient, {
          relations: ['details']
        });
        let messages = await this.chatRepository.find({
          where: { recipient_id: item.recipient },
          order: { createdAt: 'DESC' }
        });
        recipients = [{ ...user.details, userId: item.recipient, messages }, ...recipients];
      };

      return {
        success: true,
        result: recipients.sort((a, b) => b.messages[0].createdAt - a.messages[0].createdAt)
      }
    } catch (error) {
      log(error);
      return { success: false, message: error.message || "an error occurred" };
    }
  }
}
