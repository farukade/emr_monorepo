import { Controller, Get, Query, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { Voucher } from './voucher.entity';
import { VoucherDto } from './dto/voucher.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('vouchers')
export class VouchersController {
    constructor(private voucherService: VouchersService) {
    }

    @Get('list')
    getVouchers(
        @Query() urlParams,
    ): Promise<Voucher[]> {
        return this.voucherService.fetchList(urlParams);
    }

    @Post()
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
    deleteVoucher(@Param('id') id: number, @Request() req): Promise<Voucher> {
        return this.voucherService.delete(id, req.user.username);
    }
}
