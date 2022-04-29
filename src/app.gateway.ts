import { WebSocketGateway, OnGatewayInit, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ namespace: 'socket' })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private logger: Logger = new Logger('AppGateway');

	constructor() {}

	@WebSocketServer()
	server: Server;

	afterInit(server: any): any {}

	handleConnection(client: Socket, ...args: any[]): any {}

	handleDisconnect(client: Socket): any {}
}
