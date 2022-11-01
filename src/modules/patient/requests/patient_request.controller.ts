import { Controller, Post, Body, Param, Request, Delete, UseGuards, Get, Query, Patch, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PatientRequestService } from './patient_request.service';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('requests')
export class PatientRequestController {
  constructor(private patientRequestService: PatientRequestService) {}

  @Get('list/:requestType')
  getRequests(@Param('requestType') requestType: string, @Query() urlParams): Promise<any> {
    return this.patientRequestService.listRequests(requestType, urlParams);
  }

  @Get('prescriptions')
  getPrescriptionRequests(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.patientRequestService.fetchRequests({ page, limit }, urlParams);
  }

  @Get(':patientId/request/:requestType')
  getPatientRequests(
    @Param('patientId') id: number,
    @Param('requestType') requestType: string,
    @Query() urlParams,
  ): Promise<any> {
    return this.patientRequestService.listPatientRequests(requestType, id, urlParams);
  }

  @Post('save-request')
  saveRequest(@Body() param, @Request() req) {
    return this.patientRequestService.doSaveRequest(param, req.user.username);
  }

  @Post('switch-request/:id')
  switchRequest(@Param('id') id: number, @Body() param, @Request() req) {
    return this.patientRequestService.switchRequest(id, param, req.user.username);
  }

  @Patch(':requestId/receive-specimen')
  receiveLabSpecimen(@Param('requestId') requestId: number, @Request() req) {
    return this.patientRequestService.receiveSpecimen(requestId, req.user.username);
  }

  // fill request for pharmacy
  @Post('fill-request/:id')
  fillRequest(@Param('id') requestId: string, @Body() param, @Request() req) {
    return this.patientRequestService.doFillRequest(param, requestId, req.user.username, true);
  }

  @Post('unfill-request/:id')
  unfillRequest(@Param('id') requestId: string, @Body() param, @Request() req) {
    return this.patientRequestService.doFillRequest(param, requestId, req.user.username, false);
  }

  // fill request for others
  @Patch(':requestId/fill-result')
  fillLabResult(@Param('requestId') requestId: string, @Request() req, @Body() param) {
    return this.patientRequestService.fillResult(requestId, param, req.user.username);
  }

  @Patch(':requestId/approve-result')
  approveResult(@Param('requestId') requestId: number, @Query() urlParams, @Request() req, @Body() body) {
    return this.patientRequestService.doApproveResult(requestId, urlParams, body, req.user.username);
  }

  @Patch(':requestId/reject-result')
  rejectLabResult(@Param('requestId') requestId: string, @Query() urlParams, @Request() req) {
    return this.patientRequestService.rejectResult(requestId, urlParams, req.user.username);
  }

  @Delete(':requestId/delete-request')
  deletePatientRequest(@Param('requestId') requestId: string, @Query() urlParams, @Request() req) {
    return this.patientRequestService.deleteRequest(requestId, urlParams, req.user.username);
  }

  @Get(':requestId/print')
  printResult(@Param('requestId') requestId: number, @Query() urlParams): Promise<any> {
    return this.patientRequestService.printResult(requestId, urlParams);
  }

  @Put(':procedureId/schedule')
  doScheduleProcedure(@Param('procedureId') procedureId: number, @Request() req, @Body() param) {
    return this.patientRequestService.scheduleProcedure(procedureId, param, req.user.username);
  }

  @Put(':procedureId/start')
  doStartProcedure(@Param('procedureId') procedureId: number, @Request() req, @Body() param) {
    return this.patientRequestService.startProcedure(procedureId, param, req.user.username);
  }

  @Put(':procedureId/end')
  doEndProcedure(@Param('procedureId') procedureId: number, @Request() req, @Body() param) {
    return this.patientRequestService.endProcedure(procedureId, param, req.user.username);
  }

  @Post('nursing-service')
  requestNursingService(@Request() req, @Body() param) {
    return this.patientRequestService.requestNursingService(param, req.user.username);
  }

  //Get monthly average request time for each request time
  @Get('monthly-average')
  getMonthlyAverageRequestTime(@Query() urlParams) {
    return this.patientRequestService.getMonthlyAverageRequestTime(urlParams);
  }
}
