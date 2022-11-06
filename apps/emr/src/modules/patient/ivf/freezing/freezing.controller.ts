import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { OocyteDto } from './dto/oocyte.dto';
import { SpermDto } from './dto/sperm.dto';
import { EmbFreezingService } from './freezing.service';

// @UseGuards(AuthGuard('jwt'))
@ApiTags('Sperm and Oocyte Freezing')
@Controller('freezing')
export class EmbFreezingController {
  constructor(private freezingService: EmbFreezingService) {}

  @Post('oocyte/save')
  saveOocyte(@Body() data: OocyteDto) {
    return this.freezingService.saveOocyte(data);
  }

  @Post('sperm/save')
  saveSperm(@Body() data: SpermDto) {
    return this.freezingService.saveSperm(data);
  }

  @Get('get')
  getByFreezingId(@Query() urlParams) {
    return this.freezingService.getByFreezingId(urlParams);
  }

  @Get('')
  getAllFreezing(@Query() urlParams) {
    return this.freezingService.getAllEmbFreezing(urlParams);
  }
}
