import { Controller, Get, Post, Body } from '@nestjs/common';

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
@Controller('appointments')
export class AppointmentController implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('AppGateway');

    constructor(private appointmentService: AppointmentService) {}

    @Post('new')
    createNewAppointment(@Body() appointmentDto: AppointmentDto) {
        const appointment = this.appointmentService.saveNewAppointment(appointmentDto);
        this.server.emit('newAppointment', {message: 'New Appointment'});
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
