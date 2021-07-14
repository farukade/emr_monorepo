import {
    Controller,
    Body,
    ValidationPipe,
    UsePipes,
    Post,
    Get,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    Header,
    Res,
    Query,
    Request, Put, UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CafeteriaService } from './cafeteria.service';
import { CafeteriaItem } from './entities/cafeteria_item.entity';
import { CafeteriaItemDto } from './dto/cafeteria.item.dto';
import { CafeteriaSalesDto } from './dto/cafeteria-sales.dto';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { AuthGuard } from '@nestjs/passport';

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

    @Post('/sale')
    @UsePipes(ValidationPipe)
    postSales(
        @Request() req,
        @Body() param: CafeteriaSalesDto,
    ): Promise<any> {
        return this.inventoryService.saveSales(param, req.user.username);
    }
}
