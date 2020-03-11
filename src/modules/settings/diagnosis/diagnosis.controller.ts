import { Controller, Post, UseInterceptors, UploadedFile, Patch, UsePipes, ValidationPipe, Param, Body, Get } from '@nestjs/common';
import { DiagnosisService } from './diagnosis.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { DiagnosisUpdateDto } from './dto/diagnosis-update.dto';
import { Diagnosis } from '../entities/diagnosis.entity';

@Controller('settings/diagnosis')
export class DiagnosisController {
    constructor(private diagnosisService: DiagnosisService) {}

    @Get()
    getDiagnosis(): Promise<Diagnosis[]> {
        return this.diagnosisService.getAllDiagnosis();
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
    uploadDiagnosis(
        @UploadedFile() file) {
        return this.diagnosisService.doUpload(file);
    }

    @Patch(':id/update')
    @UsePipes(ValidationPipe)
    updateDiagnosis(
        @Param('id') id: string,
        @Body() diagnosisUpdateDto: DiagnosisUpdateDto,
    ): Promise<Diagnosis> {
        return this.diagnosisService.updateDiagnosis(id, diagnosisUpdateDto);
    }

}
