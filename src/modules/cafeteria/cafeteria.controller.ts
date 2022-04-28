import { Controller, Body, ValidationPipe, UsePipes, Post, Get, Param, Delete, Query, Request, Put, UseGuards } from '@nestjs/common';
import { CafeteriaService } from './cafeteria.service';
import { CafeteriaItem } from './entities/cafeteria_item.entity';
import { CafeteriaItemDto } from './dto/cafeteria.item.dto';
import { CafeteriaSalesDto } from './dto/cafeteria-sales.dto';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../common/paginate/paginate.interface';
import { CafeteriaFoodItem } from './entities/food_item.entity';
import { CafeteriaFoodItemDto } from './dto/cafeteria-food-item.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('cafeteria')
export class CafeteriaController {
	constructor(private inventoryService: CafeteriaService) {
	}

	@Get('/items')
	getAllItems(
		@Query() urlParams,
		@Request() request,
	): Promise<Pagination> {
		const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 10;
		const page = request.query.hasOwnProperty('page') ? request.query.page : 1;
		return this.inventoryService.getAllItems({ page, limit }, urlParams);
	}

	@Post('/items')
	@UsePipes(ValidationPipe)
	createItem(
		@Body() itemDto: CafeteriaItemDto,
		@Request() req,
	): Promise<CafeteriaItem> {
		return this.inventoryService.createItem(itemDto, req.user.username);
	}

	@Put('/items/:id')
	@UsePipes(ValidationPipe)
	updateItem(
		@Param('id') id: number,
		@Body() itemDto: CafeteriaItemDto,
		@Request() req,
	): Promise<CafeteriaItem> {
		return this.inventoryService.updateItem(id, itemDto, req.user.username);
	}

	@Put('/approve/:id')
	@UsePipes(ValidationPipe)
	approveItem(
		@Param('id') id: number,
		@Body() params,
		@Request() req,
	): Promise<CafeteriaItem> {
		return this.inventoryService.approveItem(id, params, req.user.username);
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

	@Get('/food-items')
	getAllFoodItems(
		@Query() urlParams,
		@Request() request,
	): Promise<Pagination> {
		const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 10;
		const page = request.query.hasOwnProperty('page') ? request.query.page : 1;
		return this.inventoryService.getFoodItems({ page, limit }, urlParams);
	}

	@Post('/food-items')
	@UsePipes(ValidationPipe)
	createFoodItem(
		@Body() itemDto: CafeteriaFoodItemDto,
		@Request() req,
	): Promise<CafeteriaFoodItem> {
		return this.inventoryService.createFoodItem(itemDto, req.user.username);
	}

	@Get('/items/groups')
	getItemsInGroups() {
		return this.inventoryService.getItemsInGroups();
	}
}
