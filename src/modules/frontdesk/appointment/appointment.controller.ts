import { Controller, Get, Post, Body } from '@nestjs/common';

import { Logger } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentDto } from './dto/appointment.dto';
import { Appointment } from './appointment.entity';

@Controller('front-desk/appointments')
export class AppointmentController {

    constructor(private appointmentService: AppointmentService) {}

    // @Post('new')
    // createNewAppointment(@Body() appointmentDto: AppointmentDto) {
    //     return this.appointmentService.saveNewAppointment(appointmentDto);
    // }

    @Get('today')
    getTodayAppointment(): Promise<Appointment[]> {
        return this.appointmentService.todaysAppointments();
    }
}
