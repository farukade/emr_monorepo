import {
    Controller,
    UseGuards,
    Post,
    Param,
    Body,
    Get,
    Request,
    Query,
    UsePipes,
    ValidationPipe,
    Patch,
} from '@nestjs/common';
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
    ): Promise<any> {
        return this.admissionService.saveAdmission(id, createDto, req.user.userId);
    }

    @Patch('/assign-bed')
    assignBed(
        @Body() params,
        @Request() req,
    ) {
        return this.admissionService.saveAssignBed(params);
    }

    @Get('/tasks')
    getTasks(
        @Query() urlParams,
        @Request() request,
    ) {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 20;
        let page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        page = page - 1;
        return this.admissionService.getTasks({page, limit}, urlParams);
    }

    @Patch('/create-task/:id')
    createTask(
        @Param('id') id: number,
        @Body() params,
        @Request() req,
    ) {
        return this.admissionService.saveClinicalTasks(id, params, req.user.userId);
    }
}
