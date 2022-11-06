import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { InventoryDto } from '../dto/inventory.dto';
import { CafeteriaInventoryService } from './cafeteria.service';

@UseGuards(AuthGuard('jwt'))
@Controller('inventory/cafeteria')
export class CafeteriaInventoryController {
  constructor(private cafeteriaInventoryService: CafeteriaInventoryService) {}

  @Get('')
  all(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.cafeteriaInventoryService.fetchAll({ page, limit }, urlParams);
  }

  @Post('/')
  @UsePipes(ValidationPipe)
  create(@Body() inventoryDto: InventoryDto, @Request() req): Promise<any> {
    return this.cafeteriaInventoryService.createItem(inventoryDto, req.user.username);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  update(@Param('id') id: string, @Body() inventoryDto: InventoryDto, @Request() req): Promise<any> {
    return this.cafeteriaInventoryService.updateItem(id, inventoryDto, req.user.username);
  }

  @Put('/:id/quantity')
  @UsePipes(ValidationPipe)
  updateQty(@Param('id') id: string, @Body() inventoryDto: InventoryDto, @Request() req): Promise<any> {
    return this.cafeteriaInventoryService.updateQty(id, inventoryDto, req.user.username);
  }

  @Delete('/:id')
  delete(@Param('id') id: number, @Request() req): Promise<any> {
    return;
  }
}
