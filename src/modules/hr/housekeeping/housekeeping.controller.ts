import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HousekeepingService } from './housekeeping.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadRosterDto } from './dto/upload-roster.dto';
import { Roster } from './entities/roster.entity';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('hr/housekeeping')
export class HousekeepingController {
  constructor(private housekeepingService: HousekeepingService) {}

  @Get('rosters')
  @UsePipes(ValidationPipe)
  listRoster(@Query() urlParams): Promise<Roster[]> {
    return this.housekeepingService.listRoster(urlParams);
  }

  @Get('/download-roster')
  downloadRoster(@Query() query): Promise<any> {
    return this.housekeepingService.downloadEmptyRoster(query);
  }

  @Post('/upload-roster')
  @UsePipes(ValidationPipe)
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
  uploadRoster(@UploadedFile() file, @Body() uplodRosterDto: UploadRosterDto, @Request() req) {
    return this.housekeepingService.doUploadRoster(file, uplodRosterDto, req.user.username);
  }
}
