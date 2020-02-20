import { Controller, Get, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { HmoService } from './hmo.service';
import { Hmo } from './hmo.entity';
import { HmoDto } from './dto/hmo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
}
