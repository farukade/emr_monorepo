import { Module } from '@nestjs/common';
import { PatientRequestRepository } from '../repositories/patient_request.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientRequestService } from './patient_request.service';
import { PatientRequestController } from './patient_request.controller';
import { PatientRequestItemRepository } from '../repositories/patient_request_items.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { TransactionsRepository } from '../../finance/transactions/transactions.repository';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { AppGateway } from '../../../app.gateway';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { DrugRepository } from '../../inventory/pharmacy/drug/drug.repository';
import { NicuRepository } from '../nicu/nicu.repository';
import { ServiceCostRepository } from '../../settings/services/repositories/service_cost.repository';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			PatientRequestRepository,
			HmoSchemeRepository,
			PatientRequestItemRepository,
			PatientRepository,
			TransactionsRepository,
			AdmissionsRepository,
			DrugRepository,
			NicuRepository,
			ServiceCostRepository,
		]),
	],
	controllers: [PatientRequestController],
	providers: [AppGateway, PatientRequestService],
})
export class PatientRequestModule {}
