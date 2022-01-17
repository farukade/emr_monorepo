import { Controller, Post, Body, Request, UseGuards, Param, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { LabourManagementService } from './labour-management.service';
import { LabourEnrollmentDto } from './dto/labour-enrollment.dto';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('labour-managements')
export class LabourManagementController {
	constructor(private labourManagementService: LabourManagementService) {
	}

	@Get('/')
	getEnrollments(
		@Query() urlParams,
		@Request() request,
	): Promise<Pagination> {
		const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
		const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
		return this.labourManagementService.getLabours({ page, limit }, urlParams);
	}

	@Post('/')
	@UsePipes(ValidationPipe)
	saveNewEnrollment(
		@Body() createDto: LabourEnrollmentDto,
		@Request() req,
	) {
		return this.labourManagementService.saveEnrollment(createDto, req.user.username);
	}

	// @Post('measurement/:id/save')
	// @UsePipes(ValidationPipe)
	// saveMeasurement(
	// 	@Body() param: LabourMeasurementDto,
	// 	@Request() req,
	// 	@Param('id') id: number,
	// ) {
	// 	return this.labourManagementService.doSaveMeasurement(id, param, req.user.username);
	// }
	//
	// @Get(':enrollmentId/measurement')
	// getMeasurement(@Param('enrollmentId') id: number): Promise<LabourMeasurement[]> {
	// 	return this.labourManagementService.fetchMeasurement(id);
	// }
	//
	// @Post('vital/:id/save')
	// @UsePipes(ValidationPipe)
	// saveVitals(
	// 	@Body() param: LabourVitalDto,
	// 	@Request() req,
	// 	@Param('id') id: string,
	// ) {
	// 	return this.labourManagementService.doSaveVital(id, param, req.user.username);
	// }
	//
	// @Get(':enrollemntId/vitals')
	// getVitals(@Param('enrollmentId') id: string): Promise<LabourVital[]> {
	// 	return this.labourManagementService.fetchVital(id);
	// }
	//
	// @Post('risk-assessment/:id/save')
	// @UsePipes(ValidationPipe)
	// saveRiskAssessment(
	// 	@Body() param: LabourRistAssesmentDto,
	// 	@Request() req,
	// 	@Param('id') id: string,
	// ) {
	// 	return this.labourManagementService.doSaveRiskAssessment(id, param, req.user.username);
	// }
	//
	// @Get(':enrollmentId/risk-assessment')
	// getRiskAssessment(@Param('enrollmentId') id: string): Promise<LabourRiskAssessment[]> {
	// 	return this.labourManagementService.fetchRiskAssessment(id);
	// }
	//
	// @Post('delivery-record/:id/save')
	// @UsePipes(ValidationPipe)
	// saveDelivery(
	// 	@Body() param: LabourDeliveryRecordDto,
	// 	@Request() req,
	// 	@Param('id') id: string,
	// ) {
	// 	return this.labourManagementService.doSaveDeliveryRecord(id, param, req.user.username);
	// }
	//
	// @Get(':enrollmentId/delivery-record')
	// getDeliveryRecord(@Param('enrollmentId') id: string): Promise<LabourDeliveryRecord[]> {
	// 	return this.labourManagementService.fetchDeliveryRecord(id);
	// }
}
