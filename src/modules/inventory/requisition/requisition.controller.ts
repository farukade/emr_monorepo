import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { RequisitionDto } from '../dto/requisition.dto';
import { RequisitionService } from './requisition.service';

@UseGuards(AuthGuard('jwt'))
@Controller('inventory/requisitions')
export class RequisitionController {
    constructor(private requisitionService: RequisitionService) {
    }

    @Get('')
    all(
        @Query() urlParams,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.requisitionService.fetchAll({ page, limit }, urlParams);
    }

    @Post('/')
    @UsePipes(ValidationPipe)
    create(
        @Body() requisitionDto: RequisitionDto,
        @Request() req,
    ): Promise<any> {
        return this.requisitionService.create(requisitionDto, req.user.username);
    }

    @Put('/:id')
    @UsePipes(ValidationPipe)
    update(
        @Param('id') id: string,
        @Body() requisitionDto: RequisitionDto,
        @Request() req,
    ): Promise<any> {
        return this.requisitionService.updateItem(id, requisitionDto, req.user.username);
    }

    @Put('/:id/approve')
    approve(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.requisitionService.approve(id, req.user.username);
    }

    @Put('/:id/decline')
    decline(
        @Param('id') id: number,
        @Body() param,
        @Request() req,
    ): Promise<any> {
        return this.requisitionService.decline(id, param, req.user.username);
    }

    @Delete('/:id')
    deleteItem(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.requisitionService.deleteRequest(id, req.user.username);
    }
}
