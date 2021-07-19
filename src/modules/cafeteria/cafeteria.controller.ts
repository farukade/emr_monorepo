import { Controller, Body, ValidationPipe, UsePipes, Post, Get, Param, Delete, Query, Request, Put, UseGuards} from '@nestjs/common';
import { CafeteriaService } from './cafeteria.service';
import { CafeteriaItem } from './entities/cafeteria_item.entity';
import { CafeteriaItemDto } from './dto/cafeteria.item.dto';
import { CafeteriaSalesDto } from './dto/cafeteria-sales.dto';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('cafeteria')
export class CafeteriaController {
    constructor(private inventoryService: CafeteriaService) {
    }

    @Get('/items')
    getAllStocks(
        @Request() request,
        @Query('q') q: string,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 30;
        const page = request.query.hasOwnProperty('page') ? request.query.page : 1;
        return this.inventoryService.getAllItems({ page, limit }, q);
    }

    @Post('/items')
    @UsePipes(ValidationPipe)
    createItem(@Body() itemDto: CafeteriaItemDto): Promise<CafeteriaItem> {
        return this.inventoryService.createItem(itemDto);
    }

    @Put('/items/:id')
    @UsePipes(ValidationPipe)
    updateStock(
        @Param('id') id: string,
        @Body() itemDto: CafeteriaItemDto,
    ): Promise<CafeteriaItem> {
        return this.inventoryService.updateItem(id, itemDto);
    }

    @Delete('/items/:id')
    deleteSubCategory(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.inventoryService.deleteItem(id, req.user.username);
    }

    @Post('/sale')
    @UsePipes(ValidationPipe)
    postSales(
        @Request() req,
        @Body() param: CafeteriaSalesDto,
    ): Promise<any> {
        return this.inventoryService.saveSales(param, req.user.username);
    }
}
