import { Module } from '@nestjs/common';
import { LabController } from './lab.controller';
import { LabService } from './lab.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabTestCategoryRepository } from './lab.category.repository';
import { LabTestRepository } from './lab.test.repository';
import { ParameterRepository } from './parameter.repository';
import { SpecimenRepository } from './specimen.repository';
import { GroupRepository } from './group.repository';
import { HmoRepository } from '../../hmo/hmo.repository';
import { GroupTestRepository } from './group_tests.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            LabTestCategoryRepository,
            LabTestRepository,
            ParameterRepository,
            SpecimenRepository,
            GroupRepository,
            GroupTestRepository,
            HmoRepository,
        ]),
    ],
    controllers: [LabController],
    providers: [LabService],
})
export class LabModule {
}
