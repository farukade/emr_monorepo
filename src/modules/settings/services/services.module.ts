import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRepository } from './service.repository';
import { ServiceCategoryRepository } from './service.category.repository';
import { ServiceSubCategoryRepository } from './service.sub.category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRepository, ServiceCategoryRepository, ServiceSubCategoryRepository])],
  providers: [ServicesService],
  controllers: [ServicesController],
})
export class ServicesModule {}
