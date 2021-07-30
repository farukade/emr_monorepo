import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StoreService } from './store.service';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { InventoryDto } from '../dto/inventory.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('inventory/stores')
export class StoreController {
    constructor(private storeService: StoreService) {
    }

    @Get('')
    all(
        @Query() urlParams,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.storeService.fetchAll({ page, limit }, urlParams);
    }

    @Post('/')
    @UsePipes(ValidationPipe)
    create(
        @Body() inventoryDto: InventoryDto,
        @Request() req,
    ): Promise<any> {
        return this.storeService.createItem(inventoryDto, req.user.username);
    }

    @Put('/:id')
    @UsePipes(ValidationPipe)
    update(
        @Param('id') id: string,
        @Body() inventoryDto: InventoryDto,
        @Request() req,
    ): Promise<any> {
        return this.storeService.updateItem(id, inventoryDto, req.user.username);
    }

    @Put('/:id/quantity')
    @UsePipes(ValidationPipe)
    updateQty(
        @Param('id') id: string,
        @Body() inventoryDto: InventoryDto,
        @Request() req,
    ): Promise<any> {
        return this.storeService.updateQty(id, inventoryDto, req.user.username);
    }

    @Delete('/:id')
    delete(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return;
    }
}
