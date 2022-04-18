import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	Request,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DoctorsAppointmentService } from './appointment.service';
import { DoctorsAppointmentDto } from './dto/appointment.dto';
import { DoctorsAppointment } from './appointment.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('doctor_appointments')
export class DoctorsAppointmentController {
	constructor(private doctorsAppointmentService: DoctorsAppointmentService) {}

	@Get('')
	getOpenDoctorsAppointment(@Query() params): Promise<DoctorsAppointment[]> {
		return this.doctorsAppointmentService.getDoctorsAppointments(params);
	}

	@Post('')
	@UsePipes(ValidationPipe)
	saveEncounter(
		@Request() req,
		@Body() data: DoctorsAppointmentDto,
	): Promise<any> {
		return this.doctorsAppointmentService.createAppointment(
			data,
			req.user.username,
		);
	}

	@Post('/check-availability')
	patientAppointments(@Body() params): Promise<any> {
		return this.doctorsAppointmentService.checkDate(params);
	}
}
