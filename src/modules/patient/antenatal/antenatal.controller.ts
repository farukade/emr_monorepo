import { Controller, Post, Body, Param, Request, Delete, UseGuards, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { AntenatalService } from './antenatal.service';
import { EnrollmentDto } from './dto/enrollment.dto';
import { AuthGuard } from '@nestjs/passport';
import { AntenatalVisitDto } from './dto/antenatal-visits.dto';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('patient/antenatal')
export class AntenatalController {
    constructor(
        private antenatalService: AntenatalService,
    ) {}

    @Get('/list')
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

    @Post('visits')
    @UsePipes(ValidationPipe)
    saveVisits(
        @Body() antenatalVisitDto: AntenatalVisitDto,
        @Request() req,
    ) {
        return this.antenatalService.saveAntenatalVisits(antenatalVisitDto, req.user.username);
    }

    @Get('visits')
    getAntenatalVisits(
        @Query() urlParams,
        @Request() request,
    ) {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 2;
        const page = request.query.hasOwnProperty('page') ? request.query.page : 0;
        return this.antenatalService.getPatientAntenatalVisits({page, limit}, urlParams);
    }

    @Delete('/:id')
    deleteAntenatal(@Param('id') id: string){
        return this.antenatalService.deleteAntenatal(id);
    }
}
