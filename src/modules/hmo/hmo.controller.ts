import {
    Controller,
    Get,
    Post,
    UsePipes,
    ValidationPipe,
    Body,
    Patch,
    Param,
    Delete,
    UploadedFile,
    UseInterceptors,
    Header,
    Res,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { HmoService } from './hmo.service';
import { Hmo } from './entities/hmo.entity';
import { HmoDto } from './dto/hmo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { HmoUploadRateDto } from './dto/hmo.upload-rate.dto';
import { HmoRate } from './entities/hmo-rate.entity';
import { Transactions } from '../finance/transactions/transaction.entity';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('hmos')
export class HmoController {
    constructor(private hmoService: HmoService) {
    }

    @Get()
    getHmo(
        @Query() param,
    ): Promise<Hmo[]> {
        return this.hmoService.getHmos(param);
    }

    @Get('/transactions')
    getHmoTransactions(
        @Query() params,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.hmoService.fetchTransactions({ page, limit }, params);
    }

    @Get('/transactions/pending')
    getHmoPendingTransactions(
        @Query() params,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.hmoService.fetchPendingTransactions({ page, limit }, params);
    }

    @Get(':id/tariff')
    getHmoTariff(
        @Param('id') id: string,
        @Query() params,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.hmoService.getHmoTariff(id, params, { page, limit });
    }

    @Post()
    @UsePipes(ValidationPipe)
    createHmo(
        @Body() hmoDto: HmoDto,
    ): Promise<Hmo> {
        return this.hmoService.createHmo(hmoDto);
    }

    @Patch('/:id/update')
    updateHmo(
        @Param('id') id: string,
        @Body() hmoDto: HmoDto,
    ): Promise<Hmo> {
        return this.hmoService.updateHmo(id, hmoDto);
    }

    @Delete('/:id')
    deleteHmo(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.hmoService.deleteHmo(id, req.user.username);
    }

    @Post('/upload-tariff')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadHmoTariffs(
        @UploadedFile() file,
        @Body() uploadDto: HmoUploadRateDto,
    ) {
        return this.hmoService.doUploadRate(uploadDto, file);
    }

    @Post('transactions/process')
    processTransaction(
        @Body() param,
        @Request() req,
    ) {
        return this.hmoService.processTransaction(param, req.user);
    }
}
