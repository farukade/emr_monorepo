import { Controller, Post, Body, Request, Param, UseGuards, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { EncounterDto } from './dto/encounter.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('consultation')
export class ConsultationController {
    constructor(private consultationService: ConsultationService) {
    }

    @Post(':patient_id/save')
    @UsePipes(ValidationPipe)
    saveEncounter(
        @Param('patient_id') patientId: number,
        @Body() param: EncounterDto,
        @Query() urlParams,
        @Request() req,
    ) {
        return this.consultationService.saveEncounter(patientId, param, urlParams, req.user.username);
    }

    @Get('/encounters')
    getEnrollments(
        @Query() urlParams,
        @Request() request,
    ) {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 10;
        const page = request.query.hasOwnProperty('page') ? request.query.page : 1;
        return this.consultationService.getEncounters({ page, limit }, urlParams);
    }

    @Get(':id')
    getEncounter(
        @Param('id') id: string,
    ) {
        return this.consultationService.getEncounter(id);
    }

}
