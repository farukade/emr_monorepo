import {
    Controller,
    UseGuards,
    Post,
    Param,
    Body,
    Get,
    Delete,
    Request,
    Query,
    UsePipes,
    ValidationPipe,
    Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { Pagination } from '../../../common/paginate/paginate.interface';

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
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.admissionService.getAdmissions({page: page - 1, limit}, urlParams);
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

    @Delete('/tasks/:taskId/delete-task')
    deleteTask(
        @Param('taskId') taskId: number,
        @Request() req,
    ): Promise<any> {
        return this.admissionService.deleteTask(taskId, req.user.username);
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
