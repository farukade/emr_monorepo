import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
   } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { AppointmentService } from './appointment.service';
import { AppointmentDto } from './dto/appointment.dto';

@WebSocketGateway()
export class AppointmentGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('AppointmentGateway');

    constructor(private appointmentService: AppointmentService) {}

    @SubscribeMessage('saveAppointment')
    async handleMessage(client: Socket, payload: AppointmentDto): Promise<void> {
        const res = await this.appointmentService.saveNewAppointment(payload);
        this.server.emit('appointmentSaved', res);
    }

    afterInit(server: Server) {
        this.logger.log('Init');
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }
}
