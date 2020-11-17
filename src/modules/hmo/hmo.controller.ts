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

@UseGuards(AuthGuard('jwt'))
@Controller('hmos')
export class HmoController {
    SERVER_URL: string = process.env.SERVER_URL;

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
    ): Promise<Transactions[]> {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 2;
        const page = request.query.hasOwnProperty('page') ? request.query.page : 0;
        return this.hmoService.fetchTransactions({ page, limit }, params);
    }

    @Get('/transactions/pending')
    getHmoPendingTransactions(
        @Query() params,
        @Request() request,
    ): Promise<Transactions[]> {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 2;
        const page = request.query.hasOwnProperty('page') ? request.query.page : 0;
        return this.hmoService.fetchPendingTransactions({ page, limit }, params);
    }

    @Get(':id/tariff')
    getHmoTariff(
        @Param('id') id: string,
        @Query() params,
    ): Promise<HmoRate[]> {
        return this.hmoService.getHmoTariff(id, params);
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
    deleteHmo(@Param('id') id: string): Promise<void> {
        return this.hmoService.deleteHmo(id);
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
