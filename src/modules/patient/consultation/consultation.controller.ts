import { Controller, Post, Body, Request, Param, UseGuards, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { EncounterDto } from './dto/encounter.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('consultation')
export class ConsultationController {
    constructor(private consultationService: ConsultationService) {}

    @Post(':patient_id/save')
    @UsePipes(ValidationPipe)
    saveEncounter(
        @Param('patient_id') patient_id: string,
        @Body() param: EncounterDto,
        @Request() req,
    ) {
        return this.consultationService.saveEncounter(patient_id, param, req.user.username);
    }

    @Get('/encounters')
    getEnrollments(
        @Query() urlParams,
        @Request() request,
    ) {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 2;
        const page = request.query.hasOwnProperty('page') ? request.query.page : 0;
        return this.consultationService.getEncounters({page, limit}, urlParams);
    }
    
    @Get(':id')
    getEncounter(
        @Param('id') id: string,
    ) {
        return this.consultationService.getEncounter(id);
    }

    @Get('appointment/:appointment_id')
    getEncounterByAppointment(
        @Param('appointment_id') appointment_id: string,
    ) {
        return this.consultationService.getEncounterByAppointment(appointment_id);
    }

}
