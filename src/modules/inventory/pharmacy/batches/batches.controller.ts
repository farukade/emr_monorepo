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
import { DrugBatchService } from './batches.service';
import { DrugBatchDto } from '../../dto/batches.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('inventory/batches')
export class DrugBatchController {
  constructor(private drugBatchService: DrugBatchService) {}

  @Get('')
  all(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.drugBatchService.fetchAll({ page, limit }, urlParams);
  }

  @Post('/')
  @UsePipes(ValidationPipe)
  create(@Body() drugBatchDto: DrugBatchDto, @Request() req): Promise<any> {
    return this.drugBatchService.create(drugBatchDto, req.user.username);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  update(@Param('id') id: string, @Body() drugBatchDto: DrugBatchDto, @Request() req): Promise<any> {
    return this.drugBatchService.update(id, drugBatchDto, req.user.username);
  }

  @Put('/:id/quantity')
  @UsePipes(ValidationPipe)
  updateQty(@Param('id') id: string, @Body() drugBatchDto: DrugBatchDto, @Request() req): Promise<any> {
    return this.drugBatchService.updateQty(id, drugBatchDto, req.user.username);
  }

  @Delete('/:id')
  delete(@Param('id') id: number, @Request() req): Promise<any> {
    return;
  }
}
