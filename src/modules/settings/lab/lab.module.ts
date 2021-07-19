import { Module } from '@nestjs/common';
import { LabController } from './lab.controller';
import { LabService } from './lab.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { LabTestCategoryRepository } from './repositories/lab.category.repository';
import { LabTestRepository } from './repositories/lab.test.repository';
import { ParameterRepository } from './repositories/parameter.repository';
import { SpecimenRepository } from './repositories/specimen.repository';
import { GroupRepository } from './repositories/group.repository';
import { GroupTestRepository } from './repositories/group_tests.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            LabTestCategoryRepository,
            LabTestRepository,
            ParameterRepository,
            SpecimenRepository,
            GroupRepository,
            GroupTestRepository,
            HmoSchemeRepository,
        ]),
    ],
    controllers: [LabController],
    providers: [LabService],
})
export class LabModule {
}
