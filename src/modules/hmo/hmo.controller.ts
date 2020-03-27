import { Controller, Get, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, Header, Res, Query } from '@nestjs/common';
import { HmoService } from './hmo.service';
import { Hmo } from './hmo.entity';
import { HmoDto } from './dto/hmo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { HmoUploadRateDto } from './dto/hmo.upload-rate.dto';

@Controller('hmos')
export class HmoController {
    SERVER_URL: string  =  'http://localhost:3000/';

    constructor(private hmoService: HmoService) {}

    @Get()
    getHmo(): Promise<Hmo[]> {
        return this.hmoService.getHmos();
    }

    @Post()
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('logo', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    createHmo(@Body() hmoDto: HmoDto,  @UploadedFile() file): Promise<Hmo> {
        return this.hmoService.createHmo(hmoDto, (file) ? `${this.SERVER_URL}${file.path}` : '');
    }

    @Patch('/:id/update')
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('logo', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    updateHmo(
        @Param('id') id: string,
        @Body() hmoDto: HmoDto,
        @UploadedFile() file,
    ): Promise<Hmo> {
        return this.hmoService.updateHmo(id, hmoDto, (file) ? `${this.SERVER_URL}${file.path}` : '');
    }

    @Delete('/:id')
    deleteHmo(@Param('id') id: string): Promise<void> {
        return this.hmoService.deleteHmo(id);
    }

    @Get('download-sample')
    @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    @Header('Content-Disposition', 'attachment; filename=hmo-sample.csv')
    async downloadHmoSample(
        @Res() res) {
        const message = await this.hmoService.dowloadHmoSample();
        if (message === 'Completed') {
            res.sendFile(join(__dirname, '../../../') + '/hmo-sample.csv');
        }
    }

    @Get('download-tariff-sample')
    @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    @Header('Content-Disposition', 'attachment; filename=hmo-rate-sample.csv')
    async downloadTariffSample(
        @Res() res,
        @Query() query,
    ) {
        const message = await this.hmoService.downloadHmoRate(query);
        if (message === 'Completed') {
            res.sendFile(join(__dirname, '../../../') + '/hmo-rate-sample.csv');
        }
    }

    @Post('/upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadHmos(
        @UploadedFile() file) {
        return this.hmoService.doUploadHmo(file);
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
}
