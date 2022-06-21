import { Controller, Get, Post, Body, Query, Param, Request, Patch, UseGuards } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentDto } from './dto/appointment.dto';
import { Appointment } from './appointment.entity';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('front-desk/appointments')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @Get('')
  listAppointments(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.appointmentService.listAppointments({ page, limit }, urlParams);
  }

  @Post('new')
  createNewAppointment(@Request() req, @Body() appointmentDto: AppointmentDto) {
    return this.appointmentService.saveNewAppointment(appointmentDto, req.user.username);
  }

  @Post('/:id/queue')
  queueAppointment(@Param('id') id: number, @Request() req, @Body() appointmentDto: AppointmentDto) {
    return this.appointmentService.queueAppointment(id, appointmentDto, req.user.username);
  }

  @Get('/patient/:patient_id')
  patientAppointments(@Param('patient_id') id: number): Promise<Appointment[]> {
    return this.appointmentService.patientAppointments(id);
  }

  @Get('view/:id')
  getAppointment(@Param('id') id: number) {
    return this.appointmentService.getAppointment(id);
  }

  @Get('/:patient_id/active')
  getActiveAppointment(@Param('patient_id') id: number) {
    return this.appointmentService.getActivePatientAppointment(id);
  }

  @Get('validate')
  validateNewAppointment(@Query() params: string) {
    return this.appointmentService.checkAppointmentStatus(params);
  }

  @Get(':id/close')
  closeAppointment(@Param('id') id: string) {
    return this.appointmentService.closeAppointment(id);
  }

  @Patch(':id/cancel')
  cancelAppointment(@Param('id') id: string, @Request() req) {
    return this.appointmentService.cancelAppointment(id, req.user.username);
  }

  @Patch('accept')
  acceptDeclineAppointment(@Body() param, @Request() req) {
    return this.appointmentService.acceptAppointment(param, req.user.username);
  }

  @Get(':id/repeat-prompt')
  repeatPrompt(@Param('id') id: number) {
    return this.appointmentService.repeatPrompt(id);
  }

  @Get('filter')
  filterConsultations(@Query() params) {
    return this.appointmentService.filterConsultations(params);
  }
}
