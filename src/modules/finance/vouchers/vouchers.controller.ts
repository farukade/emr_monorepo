import { Controller, Get, Query, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { Voucher } from './voucher.entity';
import { VoucherDto } from './dto/voucher.dto';

@Controller('vouchers')
export class VouchersController {
    constructor(private voucherService: VouchersService) {}

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
    ): Promise<any> {
        return this.voucherService.save(voucherDto);
    }

    @Patch('/:id/update')
    @UsePipes(ValidationPipe)
    updateVoucher(
        @Param('id') id: string,
        @Body() voucherDto: VoucherDto,
    ): Promise<any> {
        return this.voucherService.update(id, voucherDto);
    }

    @Delete('/:id')
    deleteVoucher(@Param('id') id: string): Promise<void> {
        return this.voucherService.delete(id);
    }
}
