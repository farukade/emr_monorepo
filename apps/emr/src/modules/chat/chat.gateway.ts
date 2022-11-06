import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { getChatRoomId } from 'apps/emr/src/common/utils/utils';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
import { ChatGroup } from './entities/chat_room.entity';
const { log } = console;

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayInit {

    constructor(
        private chatService: ChatService,
    ) { }

    @WebSocketServer() wss: Server
    private logger: Logger = new Logger('ChatGateway')

    afterInit(server: any) {
        this.logger.log('Socket Initialized')
    };

    @SubscribeMessage('send_chat')
    async handleChat(client: Socket, payload: ChatDto) {
        try {
            const { sender_id, recipient_id, room_id } = payload;
            const chatId = getChatRoomId([sender_id, recipient_id]);

            if (room_id) {
                const res = await this.chatService.getRooms({ room_id: room_id.toString() });
                if (!res.success) {
                    this.wss.emit(
                        sender_id.toString(),
                        { succes: false, message: "room not found" }
                    );
                    return;
                };
                for (const staff of res.result.staffs) {
                    this.wss.emit(
                        staff.id.toString(),
                        { success: true, ...payload }
                    );
                };

                await this.chatService.saveChat({
                    ...payload,
                    is_sent: true,
                }, null, res.result);
                return;
            } else if (sender_id && recipient_id) {
                this.wss.emit(
                    sender_id.toString(),
                    { success: true, ...payload }
                );
                this.wss.emit(
                    recipient_id.toString(),
                    { success: true, ...payload }
                );

                await this.chatService.saveChat({
                    ...payload,
                    room_id,
                    is_sent: true,
                }, chatId, null);
                return;
            };
            this.wss.emit(
                sender_id.toString(),
                { succes: false, message: "an error occurred" }
            );
        } catch (error) {
            log(error);
            return { success: false, message: error.message || "message not sent" };
        }
    }
}