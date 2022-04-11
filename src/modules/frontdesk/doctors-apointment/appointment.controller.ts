import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { doctorsAppointmentDto } from "./dto/appointment.dto";
import { DoctorsAppointmentService } from "./appointment.service";


// @UseGuards(AuthGuard('jwt'))
@Controller('doctors/appointments')
export class DoctorsAppointmentController {

    constructor(private doctorsAppointmentService: DoctorsAppointmentService) {}

    @Post('new')
    async createProposedAppointment(
        @Body() data: doctorsAppointmentDto
        ) {
        return await this.doctorsAppointmentService.createDoctorsAppointment(data);
    };
    @Get('all') 
    async getOpenDoctorsAppointment () {
        return await this.doctorsAppointmentService.getDoctorsAppointments();
    }
}