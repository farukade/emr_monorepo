import {
  Controller,
  Post,
  Body,
  Param,
  Request,
  Delete,
  UseGuards,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  Patch,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { ExcuseDutyService } from './excuse-duty.service';
import { ExcuseDutyDto } from './dto/excuse-duty.dto';
import { PatientExcuseDuty } from '../entities/patient_excuse_duty.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('patient/excuse-duties')
export class ExcuseDutyController {
  constructor(private excuseDutyService: ExcuseDutyService) {}

  @Get('/')
  getExcuseDuties(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.excuseDutyService.getExcuseDuties({ page, limit }, urlParams);
  }

  @Post('/')
  @UsePipes(ValidationPipe)
  saveExcuseDuty(@Body() createDto: ExcuseDutyDto, @Request() req) {
    return this.excuseDutyService.saveExcuseDuty(createDto, req.user.username);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  updateExcuseDuty(@Param('id') id: number, @Body() updateDto: ExcuseDutyDto, @Request() req) {
    return this.excuseDutyService.updateExcuseDuty(id, updateDto, req.user.username);
  }

  @Delete('/:id')
  deleteExcuseDuty(@Param('id') id: number, @Request() req): Promise<PatientExcuseDuty> {
    return this.excuseDutyService.deleteExcuseDuty(id, req.user.username);
  }
}
