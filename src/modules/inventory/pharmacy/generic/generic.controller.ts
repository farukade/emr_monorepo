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
import { Pagination } from '../../../../common/paginate/paginate.interface';
import { DrugGenericService } from './generic.service';
import { DrugGenericDto } from '../../dto/generic.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('inventory/generics')
export class DrugGenericController {
  constructor(private drugGenericService: DrugGenericService) {}

  @Get('')
  all(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.drugGenericService.fetchAll({ page, limit }, urlParams);
  }

  @Get('/:id')
  @UsePipes(ValidationPipe)
  find(@Param('id') id: number): Promise<any> {
    return this.drugGenericService.find(id);
  }

  @Post('/')
  @UsePipes(ValidationPipe)
  create(@Body() genericDto: DrugGenericDto, @Request() req): Promise<any> {
    return this.drugGenericService.create(genericDto, req.user.username);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  update(@Param('id') id: string, @Body() genericDto: DrugGenericDto): Promise<any> {
    return;
  }

  @Delete('/:id')
  delete(@Param('id') id: number, @Request() req): Promise<any> {
    return;
  }
}
