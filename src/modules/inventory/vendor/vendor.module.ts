import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorRepository } from './vendor.repository';

@Module({
    imports: [TypeOrmModule.forFeature([VendorRepository])],
    providers: [VendorService],
    controllers: [VendorController],
})
export class VendorModule {}
