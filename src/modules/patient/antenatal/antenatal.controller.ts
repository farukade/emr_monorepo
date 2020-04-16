import { Controller, Post, Body, Param, Request, UseGuards, Get, Query } from '@nestjs/common';
import { AntenatalService } from './antenatal.service';
import { EnrollmentDto } from './dto/enrollment.dto';
import { AuthGuard } from '@nestjs/passport';
import { AntenatalVisitDto } from './dto/antenatal-visits.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('patient/antenatal')
export class AntenatalController {
    constructor(
        private antenatalService: AntenatalService,
    ) {}

    @Post('/save')
    saveNewEnrollment(
        @Body() createDto: EnrollmentDto,
        @Request() req,
    ) {
        return this.antenatalService.saveEnrollment(createDto, req.user.username);
    }

    @Get('/list')
    getEnrollments(
        @Query() urlParams,
    ) {
        return this.antenatalService.getAntenatals(urlParams);
    }

    @Post('visits')
    saveVisits(
        @Body() antenatalVisitDto: AntenatalVisitDto,
        @Request() req,
    ) {
        return this.antenatalService.saveAntenatalVisits(antenatalVisitDto, req.user.username);
    }
}
