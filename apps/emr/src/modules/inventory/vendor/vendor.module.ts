import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorRepository } from './vendor.repository';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VendorRepository])],
  providers: [VendorService],
  controllers: [VendorController],
})
export class VendorModule {}
