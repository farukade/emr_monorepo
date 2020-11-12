import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRepository } from './service.repository';
import { ServiceCategoryRepository } from './service.category.repository';
import { ServiceSubCategoryRepository } from './service.sub.category.repository';
import { HmoRepository } from '../../hmo/hmo.repository';
import { LabTestCategoryRepository } from '../lab/lab.category.repository';
import { LabTestRepository } from '../lab/lab.test.repository';

@Module({
    imports: [TypeOrmModule.forFeature([ServiceRepository
        , ServiceCategoryRepository, ServiceSubCategoryRepository, HmoRepository, LabTestCategoryRepository, LabTestRepository])],
    providers: [ServicesService],
    controllers: [ServicesController],
})
export class ServicesModule {
}
