import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../../common/paginate/paginate.interface';
import { DrugDto } from '../../dto/drug.dto';
import { DrugService } from './drug.service';

@UseGuards(AuthGuard('jwt'))
@Controller('inventory/drugs')
export class DrugController {
    constructor(private drugService: DrugService) {
    }

    @Get('')
    all(
        @Query() urlParams,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.drugService.fetchAll({ page, limit }, urlParams);
    }

    @Post('/')
    @UsePipes(ValidationPipe)
    create(
        @Body() drugDto: DrugDto,
        @Request() req,
    ): Promise<any> {
        return this.drugService.create(drugDto, req.user.username);
    }

    @Put('/:id')
    @UsePipes(ValidationPipe)
    update(
        @Param('id') id: string,
        @Body() drugDto: DrugDto,
        @Request() req,
    ): Promise<any> {
        return this.drugService.update(id, drugDto, req.user.username);
    }

    @Delete('/:id')
    delete(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return;
    }
}
