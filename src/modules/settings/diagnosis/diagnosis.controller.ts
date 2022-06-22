import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Patch,
  UsePipes,
  ValidationPipe,
  Param,
  Body,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DiagnosisService } from './diagnosis.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { DiagnosisUpdateDto } from './dto/diagnosis-update.dto';
import { Diagnosis } from '../entities/diagnosis.entity';
import { DiagnosisPaginationDto } from './dto/diagnosis-pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('settings/diagnosis')
export class DiagnosisController {
  constructor(private diagnosisService: DiagnosisService) {}

  @Get()
  getDiagnosis(@Query() params): Promise<DiagnosisPaginationDto> {
    return this.diagnosisService.getAllDiagnosis(params);
  }

  @Get('search')
  findDiagnosis(@Query() param): Promise<Diagnosis[]> {
    return this.diagnosisService.findDiagnosis(param);
  }

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadDiagnosis(@UploadedFile() file, @Body() param) {
    return this.diagnosisService.doUpload(file, param);
  }

  @Patch(':id/update')
  @UsePipes(ValidationPipe)
  updateDiagnosis(@Param('id') id: string, @Body() diagnosisUpdateDto: DiagnosisUpdateDto): Promise<Diagnosis> {
    return this.diagnosisService.updateDiagnosis(id, diagnosisUpdateDto);
  }
}
