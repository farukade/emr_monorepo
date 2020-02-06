import { Controller, Body, ValidationPipe, UsePipes, Post, Get, Patch, Param, Delete } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryCategory } from './entities/inventory.category.entity';
import { InventoryCategoryDto } from './dto/inventory.category.dto';
import { InventorySubCategoryDto } from './dto/inventory.sub-category.dto';
import { Stock } from './entities/stock.entity';
import { StockDto } from './dto/stock.dto';
import { StockQtyDto } from './dto/stock.qty.dto';

@Controller('inventory')
export class InventoryController {
    constructor(private inventoryService: InventoryService) {}

    /**
     * INVENTORY CATEGORIES
     */
    @Get('/stocks-by-category/:id')
    getStocksByCategory(@Param('id') category_id: string): Promise<Stock[]> {
        return this.inventoryService.getStocksByCategory(category_id);
    }

    @Get('/stocks-by-sub-cate/:id')
    getStocksBySubCategory(@Param('id') category_id: string): Promise<Stock[]> {
        return this.inventoryService.getStocksBySubCategory(category_id);
    }

    @Post('/stocks')
    @UsePipes(ValidationPipe)
    createStock(@Body() stockDto: StockDto): Promise<Stock> {
        return this.inventoryService.createStock(stockDto);
    }

    @Patch('/stocks/:id/update')
    @UsePipes(ValidationPipe)
    updateStock(
        @Param('id') id: string,
        @Body() stockDto: StockDto,
    ): Promise<Stock> {
        return this.inventoryService.updateStock(id, stockDto);
    }

    @Patch('/stocks/update-quantity')
    @UsePipes(ValidationPipe)
    updateStockQty(
        @Body() stockQtyDto: StockQtyDto,
    ): Promise<Stock> {
        return this.inventoryService.updateStockQty(stockQtyDto);
    }

    @Delete('/stocks/:id')
    deleteStock(@Param('id') id: string): Promise<void> {
        return this.inventoryService.deleteStock(id);
    }
    /**
     * INVENTORY CATEGORIES
     */
    @Get('/categories')
    getCategories(): Promise<InventoryCategory[]> {
        return this.inventoryService.getCategories();
    }

    @Post('/categories')
    @UsePipes(ValidationPipe)
    createCategories(@Body() inventoryCategoryDto: InventoryCategoryDto): Promise<InventoryCategory> {
        return this.inventoryService.createCategory(inventoryCategoryDto);
    }

    @Patch('/categories/:id/update')
    @UsePipes(ValidationPipe)
    updateCategory(
        @Param('id') id: string,
        @Body() inventoryCategoryDto: InventoryCategoryDto,
    ): Promise<InventoryCategory> {
        return this.inventoryService.updateCategory(id, inventoryCategoryDto);
    }

    @Delete('/categories/:id')
    deleteCategory(@Param('id') id: string): Promise<void> {
        return this.inventoryService.deleteCategory(id);
    }

    /**
     * INVENTORY SUB CATEGORIES
     */
    @Get('categories/:id/sub-categories')
    getSubCategories(@Param('id') id: string): Promise<InventoryCategory[]> {
        return this.inventoryService.getSubCategories(id);
    }

    @Post('sub-categories')
    @UsePipes(ValidationPipe)
    createSubCategories(@Body() inventorySubCategoryDto: InventorySubCategoryDto): Promise<InventoryCategory> {
        return this.inventoryService.createSubCategory(inventorySubCategoryDto);
    }

    @Patch('/sub-categories/:id/update')
    @UsePipes(ValidationPipe)
    updateSubCategory(
        @Param('id') id: string,
        @Body() inventorySubCategoryDto: InventorySubCategoryDto,
    ): Promise<InventoryCategory> {
        return this.inventoryService.updateSubCategory(id, inventorySubCategoryDto);
    }

    @Delete('/sub-categories/:id')
    deleteSubCategory(@Param('id') id: string): Promise<void> {
        return this.inventoryService.deleteSubCategory(id);
    }
}
