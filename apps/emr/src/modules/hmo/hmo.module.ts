import { Module } from '@nestjs/common';
import { HmoController } from './hmo.controller';
import { HmoService } from './hmo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRepository } from '../settings/services/repositories/service.repository';
import { TransactionsRepository } from '../finance/transactions/transactions.repository';
import { QueueSystemRepository } from '../frontdesk/queue-system/queue-system.repository';
import { PatientRepository } from '../patient/repositories/patient.repository';
import { ServiceCategoryRepository } from '../settings/services/repositories/service_category.repository';
import { HmoOwnerRepository } from './repositories/hmo.repository';
import { HmoSchemeRepository } from './repositories/hmo_scheme.repository';
import { HmoTypeRepository } from './repositories/hmo_type.repository';
import { ServiceCostRepository } from '../settings/services/repositories/service_cost.repository';
import { PatientRequestItemRepository } from '../patient/repositories/patient_request_items.repository';
import { AppGateway } from '../../app.gateway';
import { EncounterRepository } from '../patient/consultation/encounter.repository';
import { AdmissionsRepository } from '../patient/admissions/repositories/admissions.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HmoOwnerRepository,
      HmoSchemeRepository,
      HmoTypeRepository,
      ServiceRepository,
      TransactionsRepository,
      QueueSystemRepository,
      PatientRepository,
      ServiceCategoryRepository,
      ServiceCostRepository,
      PatientRequestItemRepository,
      EncounterRepository, 
      AdmissionsRepository
    ]),
  ],
  controllers: [HmoController],
  providers: [AppGateway, HmoService],
})
export class HmoModule {}
