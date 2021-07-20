import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MigrationService } from './migration.service';
import { MigrationController } from './migration.controller';
import { PatientRepository } from '../patient/repositories/patient.repository';
import { DiagnosisRepository } from '../settings/diagnosis/diagnosis.repository';
import { BullModule } from '@nestjs/bull';
import { MigrationProcessor } from './migration.processor';
import { LoggerRepository } from '../logger/logger.repository';
import { HmoOwnerRepository } from '../hmo/repositories/hmo.repository';
import { HmoTypeRepository } from '../hmo/repositories/hmo_type.repository';
import { HmoSchemeRepository } from '../hmo/repositories/hmo_scheme.repository';
import { PatientNOKRepository } from '../patient/repositories/patient.nok.repository';
import { ServiceCategoryRepository } from '../settings/services/repositories/service_category.repository';
import { ServiceRepository } from '../settings/services/repositories/service.repository';
import { ManufacturerRepository } from '../inventory/manufacturer/manufacturer.repository';
import { DrugCategoryRepository } from '../inventory/pharmacy/drug/drug_category.repository';
import { DrugGenericRepository } from '../inventory/pharmacy/generic/generic.repository';
import { ServiceCostRepository } from '../settings/services/repositories/service_cost.repository';
import { DrugBatchRepository } from '../inventory/pharmacy/batches/batches.repository';
import { DrugRepository } from '../inventory/pharmacy/drug/drug.repository';
import { LabTestCategoryRepository } from '../settings/lab/repositories/lab.category.repository';
import { SpecimenRepository } from '../settings/lab/repositories/specimen.repository';
import { LabTestRepository } from '../settings/lab/repositories/lab.test.repository';
import { GroupRepository } from '../settings/lab/repositories/group.repository';
import { GroupTestRepository } from '../settings/lab/repositories/group_tests.repository';

@Module({
    imports: [
        BullModule.registerQueueAsync({
            name: process.env.MIGRATION_QUEUE_NAME,
            useFactory: () => ({
                redis: {
                    host: 'localhost',
                    port: 6379,
                },
            }),
        }),
        TypeOrmModule.forFeature([
            PatientRepository,
            DiagnosisRepository,
            LoggerRepository,
            HmoOwnerRepository,
            HmoTypeRepository,
            HmoSchemeRepository,
            PatientNOKRepository,
            ServiceCategoryRepository,
            ServiceRepository,
            ServiceCostRepository,
            ManufacturerRepository,
            DrugRepository,
            DrugCategoryRepository,
            DrugGenericRepository,
            DrugBatchRepository,
            LabTestCategoryRepository,
            SpecimenRepository,
            LabTestRepository,
            GroupRepository,
            GroupTestRepository,
        ]),
    ],
    providers: [MigrationService, MigrationProcessor],
    controllers: [MigrationController],
})
export class MigrationModule {
}
