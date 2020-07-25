import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';

import { Logger } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentDto } from './dto/appointment.dto';
import { Appointment } from './appointment.entity';

@Controller('front-desk/appointments')
export class AppointmentController {

    constructor(private appointmentService: AppointmentService) {}

    @Post('new')
    createNewAppointment(@Body() appointmentDto: AppointmentDto) {
        return this.appointmentService.saveNewAppointment(appointmentDto);
    }

    @Get('today')
    getTodayAppointment(): Promise<Appointment[]> {
        return this.appointmentService.todaysAppointments();
    }

    @Get('')
    listAppointments(
        @Query() params: string,
    ) {
        return this.appointmentService.listAppointments(params);
    }

    @Get('view/:id')
    getAppointment(
        @Param('id') id: string,
    ) {
        return this.appointmentService.getAppointment(id);
    }

    @Get('/:patient_id/active')
    getActiveAppointment(
        @Param('patient_id') patient_id: string,
    ) {
        return this.appointmentService.getActivePatientAppointment(patient_id);
    }

    @Get('validate')
    validateNewAppointment(
        @Query() params: string,
    ) {
        return this.appointmentService.checkAppointmentStatus(params);
    }

    @Get(':id/close')
    closeAppointment(
        @Param('id') id: string,
    ) {
        return this.appointmentService.closeAppointment(id);
    }
}
