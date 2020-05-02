import { Controller, Post, Body, Request, UseGuards, Param, Get, Query } from '@nestjs/common';
import { LabourManagementService } from './labour-management.service';
import { LabourEnrollmentDto } from './dto/labour-enrollement.dto';
import { AuthGuard } from '@nestjs/passport';
import { LabourMeasurementDto } from './dto/labour-measurement.dto';
import { LabourVitalDto } from './dto/labour-vital.dto';
import { LabourRistAssesmentDto } from './dto/labour-risk-assessment.dto';
import { LabourDeliveryRecordDto } from './dto/labour-delivery.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('labour-management')
export class LabourManagementController {
    constructor(private labourManagementService: LabourManagementService) {}

    @Get('/enrollments')
    getEnrollment(
        @Query() params,
    ) {
        return this.labourManagementService.listEnrollements(params);
    }

    @Post('enrollment/:id/save')
    saveEnrollement(
        @Body() param: LabourEnrollmentDto,
        @Request() req,
        @Param('id') id: string,
    ) {
        return this.labourManagementService.doSaveEnrollement(id, param, req.user.username);
    }

    @Post('measurement/:id/save')
    saveMeasurement(
        @Body() param: LabourMeasurementDto,
        @Request() req,
        @Param('id') id: string,
    ) {
        return this.labourManagementService.doSaveMeasurement(id, param, req.user.username);
    }

    @Post('vital/:id/save')
    saveVitals(
        @Body() param: LabourVitalDto,
        @Request() req,
        @Param('id') id: string,
    ) {
        return this.labourManagementService.doSaveVital(id, param, req.user.username);
    }

    @Post('risk-assessment/:id/save')
    saveRiskAssessment(
        @Body() param: LabourRistAssesmentDto,
        @Request() req,
        @Param('id') id: string,
    ) {
        return this.labourManagementService.doSaveRiskAssessment(id, param, req.user.username);
    }

    @Post('delivery-record/:id/save')
    saveDelivery(
        @Body() param: LabourDeliveryRecordDto,
        @Request() req,
        @Param('id') id: string,
    ) {
        return this.labourManagementService.doSaveDeliveryRecord(id, param, req.user.username);
    }
}
