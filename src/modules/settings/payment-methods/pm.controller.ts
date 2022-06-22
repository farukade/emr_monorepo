import {
  Controller,
  Post,
  Body,
  Param,
  Request,
  Delete,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { PaymentMethodService } from './pm.service';
import { PaymentMethodDto } from './dto/pm.dto';
import { PaymentMethod } from '../entities/payment-method.entity';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private paymentMethodService: PaymentMethodService) {}

  @Get('')
  getMethods(@Query() urlParams, @Request() request): Promise<Pagination> {
    return this.paymentMethodService.getMethods();
  }

  @Post('')
  @UsePipes(ValidationPipe)
  saveMethod(@Body() createDto: PaymentMethodDto, @Request() req) {
    return this.paymentMethodService.saveMethod(createDto, req.user.username);
  }

  @Patch('/:id')
  @UsePipes(ValidationPipe)
  updateMethod(@Param('id') id: number, @Body() updateDto: PaymentMethodDto, @Request() req) {
    return this.paymentMethodService.updateMethod(id, updateDto, req.user.username);
  }

  @Delete('/:id')
  deleteMethod(@Param('id') id: number, @Request() req): Promise<PaymentMethod> {
    return this.paymentMethodService.deleteMethod(id, req.user.username);
  }
}
