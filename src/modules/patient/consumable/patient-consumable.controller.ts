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
import { PatientConsumable } from '../entities/patient_consumable.entity';
import { PatientConsumableService } from './patient-consumable.service';
import { PatientConsumableDto } from './dto/consumable.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('patient/consumables')
export class PatientConsumableController {
  constructor(private consumableService: PatientConsumableService) {}

  @Get('/:id')
  getConsumables(@Param('id') id: number, @Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.consumableService.getConsumables(id, { page, limit }, urlParams);
  }

  @Post('/')
  @UsePipes(ValidationPipe)
  saveConsumable(@Body() createDto: PatientConsumableDto, @Request() req) {
    return this.consumableService.saveConsumable(createDto, req.user.username);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  updateConsumable(@Param('id') id: number, @Body() updateDto: PatientConsumableDto, @Request() req) {
    return this.consumableService.updateConsumable(id, updateDto, req.user.username);
  }

  @Delete('/:id')
  deleteConsumable(@Param('id') id: number, @Request() req): Promise<PatientConsumable> {
    return this.consumableService.deleteConsumable(id, req.user.username);
  }
}
