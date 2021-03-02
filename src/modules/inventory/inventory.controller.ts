import {
    Controller,
    Body,
    ValidationPipe,
    UsePipes,
    Post,
    Get,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    Header,
    Res,
    Request,
    Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryCategory } from './entities/inventory.category.entity';
import { InventoryCategoryDto } from './dto/inventory.category.dto';
import { InventorySubCategoryDto } from './dto/inventory.sub-category.dto';
import { Stock } from './entities/stock.entity';
import { StockDto } from './dto/stock.dto';
import { StockQtyDto } from './dto/stock.qty.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { StockUploadDto } from './dto/stock.upload.dto';
import { InventorySubCategory } from './entities/inventory.sub-category.entity';
import { Pagination } from '../../common/paginate/paginate.interface';

@Controller('inventory')
export class InventoryController {
    constructor(private inventoryService: InventoryService) {
    }

    /**
     * INVENTORY CATEGORIES
     */
    @Get('/stocks')
    getAllStocks(
        @Request() request,
        @Query('q') q: string,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 30;
        const page = request.query.hasOwnProperty('page') ? request.query.page : 1;
        return this.inventoryService.getAllStocks({ page, limit }, q);
    }

    @Get('/stocks-by-category/:id/:hmo')
    listStocksByCategory(@Param('id') category_id: string, @Param('hmo') hmo_id: string): Promise<Stock[]> {
        return this.inventoryService.getStocksByCategoryId(category_id, hmo_id);
    }

    @Get('/stocks-by-category-name/:name')
    listStocksByCategoryName(@Param('name') name: string): Promise<Stock[]> {
        return this.inventoryService.getStocksByCategoryName(name);
    }

    @Get('/stocks-by-sub-category/:id')
    getStocksBySubCategory(@Param('id') category_id: string): Promise<Stock[]> {
        return this.inventoryService.getStocksBySubCategory(category_id);
    }

    @Post('/stocks')
    @UsePipes(ValidationPipe)
    createStock(@Body() stockDto: StockDto): Promise<Stock> {
        return this.inventoryService.createStock(stockDto);
    }

    @Get('download')
    @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    @Header('Content-Disposition', 'attachment; filename=stocks.csv')
    async downloadServices(
        @Res() res) {
        const resp = await this.inventoryService.downloadStocks();
        if (resp.success) {
            res.sendFile(join(__dirname, '../../../') + '/stocks.csv');
        }
    }

    @Patch('/stocks/:id/update')
    @UsePipes(ValidationPipe)
    updateStock(
        @Param('id') id: string,
        @Body() stockDto: StockDto,
    ): Promise<Stock> {
        return this.inventoryService.updateStock(id, stockDto);
    }

    @Patch('/stocks/:id/update-expiry')
    @UsePipes(ValidationPipe)
    updateExpiryDate(
        @Param('id') id: string,
        @Body() param,
    ): Promise<Stock> {
        return this.inventoryService.updateExpiryDate(id, param);
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

    @Get('/stocks/:id')
    getStock(@Param('id') id: string): Promise<Stock> {
        return this.inventoryService.getStockById(id);
    }

    @Post('/stocks/bulk-upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadStock(
        @Body() stockUploadDto: StockUploadDto,
        @UploadedFile() file) {
        return this.inventoryService.doUploadStock(stockUploadDto, file);
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
    deleteCategory(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.inventoryService.deleteCategory(id, req.user.username);
    }

    /**
     * INVENTORY SUB CATEGORIES
     */
    @Get('sub-categories')
    getAllSubCategories(): Promise<InventorySubCategory[]> {
        return this.inventoryService.getAllSubCategories();
    }

    @Get('categories/:id/sub-categories')
    getSubCategories(@Param('id') id: string): Promise<InventorySubCategory[]> {
        return this.inventoryService.getSubCategories(id);
    }

    @Post('sub-categories')
    @UsePipes(ValidationPipe)
    createSubCategories(@Body() inventorySubCategoryDto: InventorySubCategoryDto): Promise<InventorySubCategory> {
        return this.inventoryService.createSubCategory(inventorySubCategoryDto);
    }

    @Patch('/sub-categories/:id/update')
    @UsePipes(ValidationPipe)
    updateSubCategory(
        @Param('id') id: string,
        @Body() inventorySubCategoryDto: InventorySubCategoryDto,
    ): Promise<InventorySubCategory> {
        return this.inventoryService.updateSubCategory(id, inventorySubCategoryDto);
    }

    @Delete('/sub-categories/:id')
    deleteSubCategory(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.inventoryService.deleteSubCategory(id, req.user.username);
    }
}
