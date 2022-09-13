import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { getChatRoomId } from 'src/common/utils/utils';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
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
            const { sender_id, recipient_id, body } = payload;
            const chatId = getChatRoomId([sender_id, recipient_id]);

            this.wss.emit(chatId, payload);
            this.wss.emit(recipient_id.toString(), payload);
            
            await this.chatService.saveChat({
                ...payload, 
                is_sent: true,
            }, chatId, null);

        } catch (error) {
            log(error);
            return { success: false, message: error.message || "message not sent" };
        }
    }
}