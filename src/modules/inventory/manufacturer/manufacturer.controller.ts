import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { ManufacturerService } from './manufacturer.service';
import { ManufacturerDto } from '../dto/manufacturer.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('inventory/manufacturers')
export class ManufacturerController {
  constructor(private manufacturerService: ManufacturerService) {}

  @Get('')
  all(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.manufacturerService.fetchAll({ page, limit }, urlParams);
  }

  @Post('/')
  @UsePipes(ValidationPipe)
  create(@Body() manufacturerDto: ManufacturerDto): Promise<any> {
    return this.manufacturerService.create(manufacturerDto);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  update(@Param('id') id: string, @Body() manufacturerDto: ManufacturerDto): Promise<any> {
    return this.manufacturerService.update(id, manufacturerDto);
  }

  @Delete('/:id')
  delete(@Param('id') id: number, @Request() req): Promise<any> {
    return this.manufacturerService.delete(id, req.user.username);
  }
}
