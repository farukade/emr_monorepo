import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Param,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  Put,
} from '@nestjs/common';
import { LabourManagementService } from './labour-management.service';
import { LabourEnrollmentDto } from './dto/labour-enrollment.dto';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { LabourMeasurementDto } from './dto/labour-measurement.dto';
import { LabourRiskAssessmentDto } from './dto/labour-risk-assessment.dto';
import { LabourDeliveryRecordDto } from './dto/labour-delivery.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('labour-managements')
export class LabourManagementController {
  constructor(private labourManagementService: LabourManagementService) {}

  @Get('/')
  getEnrollments(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.labourManagementService.getLabours({ page, limit }, urlParams);
  }

  @Post('/')
  @UsePipes(ValidationPipe)
  saveNewEnrollment(@Body() createDto: LabourEnrollmentDto, @Request() req) {
    return this.labourManagementService.saveEnrollment(createDto, req.user.username);
  }

  @Get(':id/measurements')
  getMeasurements(@Param('id') id: string, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.labourManagementService.fetchMeasurements(+id, { page, limit });
  }

  @Post(':id/measurements')
  @UsePipes(ValidationPipe)
  saveMeasurement(@Body() param: LabourMeasurementDto, @Request() req, @Param('id') id: string) {
    return this.labourManagementService.saveMeasurement(+id, param, req.user.username);
  }

  @Get(':id/risk-assessments')
  getRiskAssessment(@Param('id') id: string): Promise<Pagination> {
    return this.labourManagementService.fetchRiskAssessment(+id);
  }

  @Post(':id/risk-assessments')
  @UsePipes(ValidationPipe)
  saveRiskAssessment(@Body() param: LabourRiskAssessmentDto, @Request() req, @Param('id') id: string) {
    return this.labourManagementService.saveRiskAssessment(+id, param, req.user.username);
  }

  @Get(':id/delivery-record')
  getDeliveryRecord(@Param('id') id: string): Promise<any> {
    return this.labourManagementService.fetchDeliveryRecord(+id);
  }

  @Post(':id/delivery-record')
  @UsePipes(ValidationPipe)
  saveDelivery(@Body() param: LabourDeliveryRecordDto, @Request() req, @Param('id') id: string) {
    return this.labourManagementService.saveDeliveryRecord(+id, param, req.user.username);
  }

  @Put(':id/close')
  @UsePipes(ValidationPipe)
  completeDischarge(@Param('id') id: string, @Body() params, @Request() req): Promise<any> {
    return this.labourManagementService.close(+id, params, req.user.username);
  }
}
