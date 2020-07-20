import { Controller, UseGuards, Post, Body, Request, Param, Get, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IvfService } from './ivf.service';
import { IvfEnrollmentDto } from './dto/ivf_enrollment.dto';
import { IvfEnrollment } from './entities/ivf_enrollment.entity';
import {IvfDownRegulationChartDto} from './dto/ivf-down-regulation-chart.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('ivf')
export class IvfController {
    constructor(private ivfService: IvfService) {}

    @Post('enroll')
    saveEnrollment(
        @Body() ivfEnrollmentDto: IvfEnrollmentDto,
        @Request() req,
    ) {
        return this.ivfService.saveEnrollment(ivfEnrollmentDto, req.user.userId);
    }

    @Get(':patientId/history')
    ivfHistory(@Param('patientId') patientId: string ): Promise<IvfEnrollment[]> {
        return this.ivfService.getHistory(patientId);
    }

    @Get('enrollments')
    listEnrollments(
        @Query() params,
    ) {
        return this.ivfService.getEnrollments(params);
    }

    @Post('save/down-regulation')
    saveDownRegulationChart(
        @Body() ivfDownRegulationChartDto: IvfDownRegulationChartDto,
        @Request() req,
    ) {
        return this.ivfService.doSaveDownRegulationChart(ivfDownRegulationChartDto, req.user);
    }

    @Post('save/hcg-administration')
    saveHcgAdministration(
        @Body() params,
        @Request() req,
    ) {
        return this.ivfService.doSaveHCGAdministration(params, req.user);
    }

    @Post('save/theatre-procedure')
    saveTheatreProcedure(
        @Body() params,
        @Request() req,
    ) {
        return this.ivfService.doSaveTheatreProcedure(params, req.user);
    }
}
