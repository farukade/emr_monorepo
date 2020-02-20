import { Controller, Post, Body, Res, Header, UseInterceptors, UploadedFile, Get, Query } from '@nestjs/common';
import { HousekeepingService } from './housekeeping.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadRoasterDto } from './dto/upload-roaster.dto';
import { ListRoasterDto } from './dto/list-roaster.dto';
import { Roaster } from './entities/roaster.entity';

@Controller('hr/housekeeping')
export class HousekeepingController {
    constructor(private housekeepingService: HousekeepingService) {}

    @Get('download-roaster')
    @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    @Header('Content-Disposition', 'attachment;')
    async downloadRoaster(@Query() query, @Res() res) {
        const resp = await this.housekeepingService.downloadEmtpyRoaster(query);
        if (resp.message === 'Completed') {
            res.sendFile(join(__dirname, '../../../../') + '/' + resp.filename);
        }
    }

    @Post('/upload-roaster')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadRoaster(
        @UploadedFile() file,
        @Body() uploadRoasterDto: UploadRoasterDto,
    ) {
        return this.housekeepingService.doUploadRoaster(file, uploadRoasterDto);
    }

    @Post('list-roaster')
    listRoaster(@Body() listRoasterDto: ListRoasterDto): Promise<Roaster[]> {
        return this.housekeepingService.listRoaster(listRoasterDto);
    }
}
