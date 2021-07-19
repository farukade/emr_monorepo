import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { InventoryDto } from '../dto/inventory.dto';
import { CafeteriaInventoryService } from './cafeteria.service';

@UseGuards(AuthGuard('jwt'))
@Controller('inventory/cafeteria')
export class CafeteriaInventoryController {
    constructor(private cafeteriaInventoryService: CafeteriaInventoryService) {
    }

    @Get('')
    all(
        @Query() urlParams,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.cafeteriaInventoryService.fetchAll({ page, limit }, urlParams);
    }

    @Post('/')
    @UsePipes(ValidationPipe)
    create(
        @Body() inventoryDto: InventoryDto,
    ): Promise<any> {
        return;
    }

    @Put('/:id')
    @UsePipes(ValidationPipe)
    update(
        @Param('id') id: string,
        @Body() inventoryDto: InventoryDto,
    ): Promise<any> {
        return;
    }

    @Delete('/:id')
    delete(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return;
    }
}
