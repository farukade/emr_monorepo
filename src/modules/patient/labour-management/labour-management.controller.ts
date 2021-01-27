import { Controller, Post, Body, Request, UseGuards, Param, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { LabourManagementService } from './labour-management.service';
import { LabourEnrollmentDto } from './dto/labour-enrollement.dto';
import { AuthGuard } from '@nestjs/passport';
import { LabourMeasurementDto } from './dto/labour-measurement.dto';
import { LabourVitalDto } from './dto/labour-vital.dto';
import { LabourRistAssesmentDto } from './dto/labour-risk-assessment.dto';
import { LabourDeliveryRecordDto } from './dto/labour-delivery.dto';
import { LabourVital } from './entities/labour_vital.entity';
import { LabourMeasurement } from './entities/labour_measurement.entity';
import { LabourRiskAssessment } from './entities/labour_risk_assessment.entity';
import { LabourDeliveryRecord } from './entities/labour_delivery_record.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('labour-management')
export class LabourManagementController {
    constructor(private labourManagementService: LabourManagementService) {}

    @Get('/enrollments')
    getEnrollments(
        @Query() params,
    ) {
        return this.labourManagementService.listEnrollments(params);
    }

    @Get('/enrollments/:id')
    getEnrollment(
        @Param('id') id: number,
    ) {
        return this.labourManagementService.getEnrollment(id);
    }

    @Post('enrollment/:id/save')
    @UsePipes(ValidationPipe)
    saveEnrollement(
        @Body() param: LabourEnrollmentDto,
        @Request() req,
        @Param('id') id: number,
    ) {
        return this.labourManagementService.doSaveEnrollment(id, param, req.user.username);
    }

    @Post('measurement/:id/save')
    @UsePipes(ValidationPipe)
    saveMeasurement(
        @Body() param: LabourMeasurementDto,
        @Request() req,
        @Param('id') id: string,
    ) {
        return this.labourManagementService.doSaveMeasurement(id, param, req.user.username);
    }

    @Get(':enrollementId/measurement')
    getMeasurement(@Param('enrollementId') id: number): Promise<LabourMeasurement[]> {
        return this.labourManagementService.fetchMeasurement(id);
    }

    @Post('vital/:id/save')
    @UsePipes(ValidationPipe)
    saveVitals(
        @Body() param: LabourVitalDto,
        @Request() req,
        @Param('id') id: string,
    ) {
        return this.labourManagementService.doSaveVital(id, param, req.user.username);
    }

    @Get(':enrollementId/vitals')
    getVitals(@Param('enrollementId') id: string): Promise<LabourVital[]> {
        return this.labourManagementService.fetchVital(id);
    }

    @Post('risk-assessment/:id/save')
    @UsePipes(ValidationPipe)
    saveRiskAssessment(
        @Body() param: LabourRistAssesmentDto,
        @Request() req,
        @Param('id') id: string,
    ) {
        return this.labourManagementService.doSaveRiskAssessment(id, param, req.user.username);
    }

    @Get(':enrollementId/risk-assessment')
    getRiskAssessment(@Param('enrollementId') id: string): Promise<LabourRiskAssessment[]> {
        return this.labourManagementService.fetchRiskAssessment(id);
    }

    @Post('delivery-record/:id/save')
    @UsePipes(ValidationPipe)
    saveDelivery(
        @Body() param: LabourDeliveryRecordDto,
        @Request() req,
        @Param('id') id: string,
    ) {
        return this.labourManagementService.doSaveDeliveryRecord(id, param, req.user.username);
    }

    @Get(':enrollementId/delivery-record')
    getDeliveryRecord(@Param('enrollementId') id: string): Promise<LabourDeliveryRecord[]> {
        return this.labourManagementService.fetchDeliveryRecord(id);
    }
}
