import { Controller, Post, Body, Param, Request, Delete, UseGuards, Get, Query, UsePipes, ValidationPipe, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PatientRequestService } from './patient_request.service';

@UseGuards(AuthGuard('jwt'))
@Controller('requests')
export class PatientRequestController {
    constructor(
        private patientRequestService: PatientRequestService,
    ) {}

    @Get('list/:requestType')
    getRequests(
        @Param('requestType') requestType: string,
        @Query() urlParams,
    ): Promise<any> {
        return this.patientRequestService.listRequests(requestType, urlParams);
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
    saveRequest(
        @Body() param,
        @Request() req,
    ) {
        return this.patientRequestService.doSaveRequest(param, req.user.username);
    }

    @Patch(':requestId/receive-specimen')
    receiveLabSpecimen(
        @Param('requestId') requestId: number,
        @Request() req,
    ) {
        return this.patientRequestService.receiveSpecimen(requestId, req.user.username);
    }

    // fill request for pharmacy
    @Post('fill-request/:id')
    fillRequest(
        @Param('id') requestId: string,
        @Body() param,
        @Request() req,
    ) {
        return this.patientRequestService.doFillRequest(param, requestId, req.user.username);
    }

    // fill request for others
    @Patch(':requestId/fill-result')
    fillLabResult(
        @Param('requestId') requestId: string,
        @Request() req,
        @Body() param,
    ) {
        return this.patientRequestService.fillResult(requestId, param, req.user.username);
    }

    @Patch(':requestId/approve-result')
    approveResult(
        @Param('requestId') requestId: number,
        @Query() urlParams,
        @Request() req,
    ) {
        return this.patientRequestService.doApproveResult(requestId, urlParams, req.user.username);
    }

    @Patch(':requestId/reject-result')
    rejectLabResult(
        @Param('requestId') requestId: string,
        @Query() urlParams,
        @Request() req,
    ) {
        return this.patientRequestService.rejectResult(requestId, urlParams, req.user.username);
    }

    @Delete(':requestId/delete-request')
    deletePatientRequest(
        @Param('requestId') requestId: string,
        @Query() urlParams,
        @Request() req,
    ) {
        return this.patientRequestService.deleteRequest(requestId, urlParams, req.user.username);
    }

    @Get(':requestId/print')
    printResult(
        @Param('requestId') requestId: number,
        @Query() urlParams,
    ): Promise<any> {
        return this.patientRequestService.printResult(requestId, urlParams);
    }
}
