import { Controller, Get, Request, UseGuards, Query, Patch, Body, Param } from '@nestjs/common';
import { NicuService } from './nicu.service';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('nicu')
export class NicuController {
    constructor(private readonly nicuService: NicuService) {
    }

    @Get('')
    listEnrollments(
        @Query() urlParams,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.nicuService.getAdmissions({ page, limit }, urlParams);
    }

    @Patch(':id/assign-accommodation')
    assignBed(
        @Param('id') id: number,
        @Body() params,
        @Request() req,
    ) {
        return this.nicuService.saveAccommodation(id, params, req.user.username);
    }
}
