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
import { VendorService } from './vendor.service';
import { VendorDto } from '../dto/vendor.dto';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('inventory/vendors')
export class VendorController {
  constructor(private vendorService: VendorService) {}

  @Get('')
  all(@Query() urlParams, @Request() request): Promise<Pagination> {
    const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
    const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
    return this.vendorService.fetchAll({ page, limit }, urlParams);
  }

  @Post('/')
  @UsePipes(ValidationPipe)
  create(@Body() vendorDto: VendorDto): Promise<any> {
    return this.vendorService.create(vendorDto);
  }

  @Put('/:id')
  @UsePipes(ValidationPipe)
  update(@Param('id') id: string, @Body() vendorDto: VendorDto): Promise<any> {
    return this.vendorService.update(id, vendorDto);
  }

  @Delete('/:id')
  delete(@Param('id') id: number, @Request() req): Promise<any> {
    return this.vendorService.delete(id, req.user.username);
  }
}
