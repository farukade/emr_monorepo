import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRepository } from './repositories/service.repository';
import { ServiceCategoryRepository } from './repositories/service_category.repository';
import { HmoOwnerRepository } from '../../hmo/repositories/hmo.repository';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { LabTestCategoryRepository } from '../lab/repositories/lab.category.repository';
import { LabTestRepository } from '../lab/repositories/lab.test.repository';
import { ServiceCostRepository } from './repositories/service_cost.repository';
import { DrugRepository } from '../../inventory/pharmacy/drug/drug.repository';
import { RoomCategoryRepository } from '../room/room.category.repository';
import { ServicesCategoryController } from './service-categories.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ServiceRepository,
            ServiceCategoryRepository,
            LabTestCategoryRepository,
            LabTestRepository,
            HmoOwnerRepository,
            HmoSchemeRepository,
            ServiceCostRepository,
            DrugRepository,
            RoomCategoryRepository,
        ]),
    ],
    providers: [ServicesService],
    controllers: [ServicesController, ServicesCategoryController],
})
export class ServicesModule {
}
