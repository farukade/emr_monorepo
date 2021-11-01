import { Controller, Post, Body, Param, Request, Delete, UseGuards, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { AntenatalService } from './antenatal.service';
import { EnrollmentDto } from './dto/enrollment.dto';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('patient/antenatal')
export class AntenatalController {
    constructor(
        private antenatalService: AntenatalService,
    ) {}

    @Get('')
    getEnrollments(
        @Query() urlParams,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.antenatalService.getAntenatals({page, limit}, urlParams);
    }

    @Post('/save')
    @UsePipes(ValidationPipe)
    saveNewEnrollment(
        @Body() createDto: EnrollmentDto,
        @Request() req,
    ) {
        return this.antenatalService.saveEnrollment(createDto, req.user.username);
    }

    @Delete('/:id')
    deleteAntenatal(
        @Param('id') id: string,
    ) {
        return this.antenatalService.deleteAntenatal(id);
    }

    @Get('assessments/:id')
    getAntenatalVisits(
        @Param('id') id: number,
        @Request() request,
    ) {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.antenatalService.getAssessments(id, {page, limit});
    }

    @Post('assessments/:id')
    @UsePipes(ValidationPipe)
    saveVisits(
        @Param('id') id: number,
        @Body() params,
        @Request() req,
    ) {
        return this.antenatalService.saveAntenatalVisits(id, params, req.user.username);
    }
}
