import { Controller, Get, Query, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { Voucher } from './voucher.entity';
import { VoucherDto } from './dto/voucher.dto';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('vouchers')
export class VouchersController {
    constructor(private voucherService: VouchersService) {
    }

    @Get('list')
    getVouchers(
        @Query() urlParams,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.voucherService.fetchList({ page, limit }, urlParams);
    }

    @Get(':code')
    getVoucher(
        @Param('code') code: string,
    ): Promise<Voucher> {
        return this.voucherService.fetchByCode(code);
    }

    @Post('')
    @UsePipes(ValidationPipe)
    saveVoucher(
        @Body() voucherDto: VoucherDto,
        @Request() req,
    ): Promise<any> {
        return this.voucherService.save(voucherDto, req.user.username);
    }

    @Patch('/:id/update')
    @UsePipes(ValidationPipe)
    updateVoucher(
        @Param('id') id: string,
        @Body() voucherDto: VoucherDto,
        @Request() req,
    ): Promise<any> {
        return this.voucherService.update(id, voucherDto, req.user.username);
    }

    @Delete('/:id')
    deleteVoucher(
        @Param('id') id: number,
        @Request() req,
    ): Promise<Voucher> {
        return this.voucherService.delete(id, req.user.username);
    }
}
