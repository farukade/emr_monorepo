import {
  Controller,
  Body,
  ValidationPipe,
  UsePipes,
  Post,
  Get,
  Param,
  Delete,
  Query,
  Request,
  Put,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { CafeteriaService } from './cafeteria.service';
import { CafeteriaItem } from './entities/cafeteria_item.entity';
import { CafeteriaItemDto } from './dto/cafeteria.item.dto';
import { CafeteriaSalesDto } from './dto/cafeteria-sales.dto';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../common/paginate/paginate.interface';
import { CafeteriaFoodItem } from './entities/food_item.entity';
import { CafeteriaFoodItemDto } from './dto/cafeteria-food-item.dto';
import { OrderDto } from './dto/order.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('cafeteria')
export class CafeteriaController {
  constructor(private cafeteriaService: CafeteriaService) {}

  @Get('/items')
  getAllItems(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 10;
    const page = request.query.hasOwnProperty('page') ? request.query.page : 1;
    return this.cafeteriaService.getAllItems({ page, limit }, urlParams);
  }

  @Post('/items')
  @UsePipes(ValidationPipe)
  createItem(@Body() itemDto: CafeteriaItemDto, @Request() req): Promise<CafeteriaItem> {
    return this.cafeteriaService.createItem(itemDto, req.user.username);
  }

  @Put('/items/:id')
  @UsePipes(ValidationPipe)
  updateItem(@Param('id') id: number, @Body() itemDto: CafeteriaItemDto, @Request() req): Promise<CafeteriaItem> {
    return this.cafeteriaService.updateItem(id, itemDto, req.user.username);
  }

  @Put('/approve/:id')
  @UsePipes(ValidationPipe)
  approveItem(@Param('id') id: number, @Body() params, @Request() req): Promise<CafeteriaItem> {
    return this.cafeteriaService.approveItem(id, params, req.user.username);
  }

  @Delete('/items/:id')
  deleteSubCategory(@Param('id') id: number, @Request() req): Promise<any> {
    return this.cafeteriaService.deleteItem(id, req.user.username);
  }

  @Get('/showcase-items')
  getShowcaseItems(@Query() params) {
    return this.cafeteriaService.getShowcaseItems(params);
  }

  @Get('/food-items')
  getAllFoodItems(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 10;
    const page = request.query.hasOwnProperty('page') ? request.query.page : 1;
    return this.cafeteriaService.getFoodItems({ page, limit }, urlParams);
  }

  @Post('/food-items')
  @UsePipes(ValidationPipe)
  createFoodItem(@Body() itemDto: CafeteriaFoodItemDto, @Request() req): Promise<CafeteriaFoodItem> {
    return this.cafeteriaService.createFoodItem(itemDto, req.user.username);
  }

  @Put('/food-items/:id')
  @UsePipes(ValidationPipe)
  updateFoodItem(
    @Param('id') id: number,
    @Body() itemDto: CafeteriaFoodItemDto,
    @Request() req,
  ): Promise<CafeteriaFoodItem> {
    return this.cafeteriaService.updateFoodItem(id, itemDto, req.user.username);
  }

  @Patch('/food-items/:id/a-la-carte')
  @UsePipes(ValidationPipe)
  updateFoodItemCategory(@Param('id') id: number, @Request() req): Promise<CafeteriaFoodItem> {
    return this.cafeteriaService.updateFoodItemCategory(id, req.user.username);
  }

  @Post('/take-order')
  @UsePipes(ValidationPipe)
  takeOrder(@Request() req, @Body() param: OrderDto): Promise<any> {
    return this.cafeteriaService.takeOrder(param, req.user.username);
  }

  @Get('/orders')
  getOrders(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 10;
    const page = request.query.hasOwnProperty('page') ? request.query.page : 1;
    return this.cafeteriaService.getOrders({ page, limit }, urlParams);
  }

  @Post('/orders/:id/cancel')
  @UsePipes(ValidationPipe)
  cancelOrder(@Request() req, @Param('id') id: string): Promise<any> {
    return this.cafeteriaService.cancelOrder(+id, req.user.username);
  }

  @Post('/orders/:id/ready')
  @UsePipes(ValidationPipe)
  readyOrder(@Request() req, @Param('id') id: string): Promise<any> {
    return this.cafeteriaService.readyOrder(+id, req.user.username);
  }

  @Post('/orders/sale')
  @UsePipes(ValidationPipe)
  postSales(@Request() req, @Body() param: CafeteriaSalesDto): Promise<any> {
    return this.cafeteriaService.saveSales(param, req.user.username);
  }
}
