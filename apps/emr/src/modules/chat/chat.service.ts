import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getChatRoomId } from 'apps/emr/src/common/utils/utils';
import { StaffRepository } from '../hr/staff/staff.repository';
import { ChatRepository } from './repositories/chat.repository';
import { ChatDto } from './dto/chat.dto';
import { ChatEntity } from './entities/chat.entity';
import { ChatGroupRepository } from './repositories/chat-room.repository';
import { ChatGroup } from './entities/chat_room.entity';
const { log } = console;

@Injectable()
export class ChatService {

  constructor(
    @InjectRepository(ChatRepository)
    private chatRepository: ChatRepository,
    @InjectRepository(StaffRepository)
    private staffRepository: StaffRepository,
    @InjectRepository(ChatGroupRepository)
    private roomRepository: ChatGroupRepository
  ) { }

  async saveChat(data: ChatDto, chat_id: string, room: ChatGroup) {
    try {

      let recipient;
      if (data.recipient_id) {
        recipient = await this.staffRepository.findOne(+data.recipient_id);
      };

      const sender = await this.staffRepository.findOne(+data.sender_id);

      if (!sender && !recipient)
        return { success: false, message: "'sender | recipient' not found" };

      const chat = this.chatRepository.create({
        ...data,
        chat_id,
        room
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
        recipient = await this.staffRepository.findOne(+recipient_id);
      };

      let sender;
      if (sender_id) {
        sender = await this.staffRepository.findOne(+sender_id);
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

      let room;
      if (room_id && room_id != "") {
        room = await this.roomRepository.findOne(+room_id);
      }

      const total = await query.getCount();

      let result = [];
      const chats = await query
        .orderBy('c.createdAt', 'DESC')
        .take(limit)
        .skip(skip)
        .getMany();

      for (const item of chats) {
        let staff = await this.staffRepository.findOne(item.sender_id);
        result = [...result, { 
          ...item, 
          sender_first_name: staff.first_name,
          sender_last_name: staff.last_name,
        }]
      }

      return {
        success: true,
        lastPage: Math.ceil(total / limit),
        itemsPerPage: limit,
        totalItems: total,
        currentPage: page,
        room,
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
      if (recipient[0]?.recipient) {
      for (const item of recipient) {
        let user = await this.staffRepository.findOne(item.recipient);
        let messages = await this.chatRepository.find({
          where: { recipient_id: item.recipient },
          order: { createdAt: 'DESC' }
        });
        recipients = [{ ...user, userId: item.recipient, messages }, ...recipients];
      };
    }

      return {
        success: true,
        result: recipients.sort((a, b) => b.messages[0].createdAt - a.messages[0].createdAt)
      }
    } catch (error) {
      log(error);
      return { success: false, message: error.message || "an error occurred" };
    }
  }

  async addRoom(data) {
    try {
      const room = this.roomRepository.create(data);
      await this.roomRepository.save(room);
      return { success: true, message: "chat group created", data: room };
    } catch (error) {
      log(error);
      return { success: true, message: error.message || "an error occurred" };
    }
  };

  async getRooms(params: { room_id: string }) {
    try {
      const { room_id } = params;
      let result;
      if (room_id && room_id != "") {
        result = await this.roomRepository.findOne(+room_id, {
          relations: ['staffs']
        });
        if (!result) {
          return {
            success: false,
            message: "chat group not found"
          }
        }
      } else {
        result = await this.roomRepository.find({
          relations: ['staffs']
        });
        if (!result.length) {
          return {
            success: false,
            message: "chat groups not found"
          }
        }
      };

      return { success: true, result }
    } catch (error) {
      log(error);
      return { success: true, message: error.message || "an error occurred" }
    }
  }

  async addUserToGroup(data: { room_id: number, ids: number[] }) {
    try {
      const { room_id, ids } = data;

      const staff = await this.staffRepository.createQueryBuilder('s')
        .where('s.id IN (:...ids)', { ids })
        .getMany();

      if (!staff.length)
        return { success: false, message: "staff(s) not found" };

      let room = await this.roomRepository.findOne(room_id, {
        relations: ['staffs']
      });

      if (!room)
        return { success: false, message: "room not found" };

      room.staffs = [...room.staffs, ...staff];

      await this.roomRepository.save(room);

      return { success: true, message: "staff(s) added to group" }

    } catch (error) {
      log(error);
      return {
        success: false,
        message: error.message || "an error occurred"
      }
    }
  }
}
