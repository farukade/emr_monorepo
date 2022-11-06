import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { InventoryActivityService } from './activity.service';

@UseGuards(AuthGuard('jwt'))
@Controller('inventory/activities')
export class InventoryActivityController {
  constructor(private inventoryActivityService: InventoryActivityService) {}

  @Get('')
  all(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;

    return this.inventoryActivityService.fetchAll({ page, limit }, urlParams);
  }
}
