import { Body, Controller, Delete, Get, Param, Post, Put, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { Vendor } from './vendor.entity';
import { VendorDto } from './vendor.dto';
import { VendorService } from './vendor.service';

@Controller('inventory/vendors')
export class VendorController {
    constructor(private vendorService: VendorService) {
    }

    @Get('')
    all(
        @Request() request,
    ): Promise<Vendor[]> {
        return this.vendorService.getAll();
    }

    @Post('/')
    @UsePipes(ValidationPipe)
    create(@Body() vendorDto: VendorDto): Promise<Vendor> {
        return this.vendorService.create(vendorDto);
    }

    @Put('/:id')
    @UsePipes(ValidationPipe)
    update(
        @Param('id') id: string,
        @Body() vendorDto: VendorDto,
    ): Promise<Vendor> {
        return this.vendorService.update(id, vendorDto);
    }

    @Delete('/:id')
    delete(@Param('id') id: string): Promise<void> {
        return this.vendorService.delete(id);
    }
}
