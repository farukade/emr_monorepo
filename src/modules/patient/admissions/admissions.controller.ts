import { Controller, UseGuards, Post, Param, Body, Get, Request, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('patient/admissions')
export class AdmissionsController {
    constructor(
        private admissionService: AdmissionsService,
    ) {}

    @Get()
    getAdmissions(
        @Query() urlParams,
        @Request() request,
    ) {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 2;
        const page = request.query.hasOwnProperty('page') ? request.query.page : 0;
        return this.admissionService.getAdmissions({page, limit}, urlParams);
    }

    @Post(':id/save')
    @UsePipes(ValidationPipe)
    saveNewAdmission(
        @Param('id') id: string,
        @Body() createDto: CreateAdmissionDto,
        @Request() req,
    ) {
        return this.admissionService.saveAdmission(id, createDto, req.user.username);
    }
}
