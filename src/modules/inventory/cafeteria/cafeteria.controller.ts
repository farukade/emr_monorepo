import { Controller, Body, ValidationPipe, UsePipes, Post, Get, Patch, Param, Delete, UseInterceptors, UploadedFile, Header, Res, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CafeteriaService } from './cafeteria.service';
import { CafeteriaItem } from './entities/cafeteria_item.entity';
import { CafeteriaItemDto } from './dto/cafeteria.item.dto';
import { CafeteriaInventoryDto } from './dto/cafeteria.inventory.dto';
import { CafeteriaInventoryQtyDto } from './dto/cafeteria.inventory.qty.dto';
import { CafeteriaInventory } from './entities/cafeteria_inventory.entity';
import { CafeteriaInventoryCategory } from './entities/cafeteria_inventory_category.entity';
import { CafeteriaInventoryCategoryDto } from './dto/cafeteria.inventory.category.dto';
import { CafeteriaItemCategory } from './entities/cafeteria_item_category.entity';
import { CafeteriaItemCategoryDto } from './dto/cafeteria.item.category.dto';
import { CafeteriaSalesDto } from './dto/cafeteria-sales.dto';

@Controller('cafeteria')
export class CafeteriaController {
    constructor(private inventoryService: CafeteriaService) {}

    /**
     * INVENTORY ITEMS
     */
    @Get('/items')
    getAllItems(
        @Query() urlParam,
    ): Promise<CafeteriaItem[]> {
        return this.inventoryService.getAllItems(urlParam);
    }

    @Get('/items-by-category/:id')
    getItemsByCategory(@Param('id') category_id: string): Promise<CafeteriaItem[]> {
        return this.inventoryService.getItemsByCategory(category_id);
    }

    @Post('/items')
    @UsePipes(ValidationPipe)
    createItem(@Body() stockDto: CafeteriaItemDto): Promise<CafeteriaItem> {
        return this.inventoryService.createItem(stockDto);
    }

    @Get('items/download')
    @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    @Header('Content-Disposition', 'attachment; filename=cafeteria-item.csv')
    async downloadItems(
        @Res() res) {
        const resp = await this.inventoryService.downloadStocks();
        if (resp.success) {
            res.sendFile(join(__dirname, '../../../../') + '/cafeteria-items.csv');
        }
    }

    @Patch('/items/:id/update')
    @UsePipes(ValidationPipe)
    updateStock(
        @Param('id') id: string,
        @Body() stockDto: CafeteriaItemDto,
    ): Promise<CafeteriaItem> {
        return this.inventoryService.updateItem(id, stockDto);
    }

    @Delete('/items/:id')
    deleteItem(@Param('id') id: string): Promise<void> {
        return this.inventoryService.deleteItem(id);
    }

    @Post('/items/bulk-upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
        filename: (req, file, cb) => {
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
            return cb(null, `${randomName}${extname(file.originalname)}`);
        },
        }),
    }))
    uploadStock(
        @UploadedFile() file) {
        return this.inventoryService.doUploadItem(file);
    }

    /**
     * INVENTORY
     */
    @Get('/inventories')
    getInventories(): Promise<CafeteriaInventory[]> {
        return this.inventoryService.getAllInventories();
    }

    @Get('/inventories-by-category/:id')
    getInventoriesByCategory(@Param('id') category_id: string): Promise<CafeteriaInventory[]> {
        return this.inventoryService.getInventoryByCategory(category_id);
    }

    @Post('/inventories')
    @UsePipes(ValidationPipe)
    createInventory(@Body() stockDto: CafeteriaInventoryDto): Promise<CafeteriaInventory> {
        return this.inventoryService.createInventory(stockDto);
    }

    @Patch('/inventory/update-quantity')
    @UsePipes(ValidationPipe)
    updateInventoryQty(
        @Body() param: CafeteriaInventoryQtyDto,
    ): Promise<CafeteriaInventory> {
        return this.inventoryService.updateInventoryQty(param);
    }

    @Delete('/inventory/:id')
    deleteInventory(@Param('id') id: string): Promise<void> {
        return this.inventoryService.deleteInventory(id);
    }

    @Patch('/inventory/:id/update')
    @UsePipes(ValidationPipe)
    updateInventory(
        @Param('id') id: string,
        @Body() param: CafeteriaInventoryDto,
    ): Promise<CafeteriaInventory> {
        return this.inventoryService.updateInventory(id, param);
    }

    // @Get('/items/:id')
    // getItem(@Param('id') id: string): Promise<CafeteriaItem> {
    //     return this.inventoryService.getItemById(id);
    // }

    /**
     * INVENTORY CATEGORIES
     */
    @Get('/inventory/categories')
    getInventoryCategories(): Promise<CafeteriaInventoryCategory[]> {
        return this.inventoryService.getInventoryCategories();
    }

    @Post('/inventory/categories')
    @UsePipes(ValidationPipe)
    createInvCategories(@Body() param: CafeteriaInventoryCategoryDto): Promise<CafeteriaInventoryCategory> {
        return this.inventoryService.createInventoryCategory(param);
    }

    @Patch('/inventory/categories/:id/update')
    @UsePipes(ValidationPipe)
    updateInvCategory(
        @Param('id') id: string,
        @Body() param: CafeteriaInventoryCategoryDto,
    ): Promise<CafeteriaInventoryCategory> {
        return this.inventoryService.updateInventoryCategory(id, param);
    }

    @Delete('/inventory/categories/:id')
    deleteInvCategory(@Param('id') id: string): Promise<void> {
        return this.inventoryService.deleteInventoryCategory(id);
    }

    /**
     * ITEM CATEGORIES
     */
    @Get('items/categories')
    getItemCategories(): Promise<CafeteriaItemCategory[]> {
        return this.inventoryService.getItemCategories();
    }

    @Post('items/categories')
    @UsePipes(ValidationPipe)
    createSubCategories(@Body() param: CafeteriaItemCategoryDto): Promise<CafeteriaItemCategory> {
        return this.inventoryService.createItemCategory(param);
    }

    @Patch('/items/categories/:id/update')
    @UsePipes(ValidationPipe)
    updateSubCategory(
        @Param('id') id: string,
        @Body() param: CafeteriaItemCategoryDto,
    ): Promise<CafeteriaItemCategory> {
        return this.inventoryService.updateItemCategory(id, param);
    }

    @Delete('/items/categories/:id')
    deleteItemCategory(@Param('id') id: string): Promise<void> {
        return this.inventoryService.deleteItemCategory(id);
    }

    @Post('/sales')
    @UsePipes(ValidationPipe)
    postSales(@Body() param: CafeteriaSalesDto): Promise<any> {
        return this.inventoryService.saveSales(param);
    }
}
