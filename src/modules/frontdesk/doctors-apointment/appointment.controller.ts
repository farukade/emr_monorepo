import {
	Body,
	Controller,
	Get,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DoctorsAppointmentService } from './appointment.service';
import { DoctorsAppointmentDto } from './dto/appointment.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('doctor_appointments')
export class DoctorsAppointmentController {
	constructor(private doctorsAppointmentService: DoctorsAppointmentService) {}

	@Get('')
	async getOpenDoctorsAppointment() {
		return await this.doctorsAppointmentService.getDoctorsAppointments();
	}

	@Post('')
	async createAppointment(@Request() req, @Body() data: DoctorsAppointmentDto) {
		return await this.doctorsAppointmentService.createAppointment(
			data,
			req.user.username,
		);
	}
}
