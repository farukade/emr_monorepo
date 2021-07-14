import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { RequisitionService } from './requisition.service';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('inventory/requisitions')
export class RequisitionController {
    constructor(private requisitionService: RequisitionService) {
    }

    @Get('')
    listRequisitions(
        @Query() urlParams,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.requisitionService.fetchRequisitions({ page, limit }, urlParams);
    }
}
