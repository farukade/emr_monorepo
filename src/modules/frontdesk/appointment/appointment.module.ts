import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { AppointmentRepository } from './appointment.repository';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { SpecializationRepository } from '../../settings/specialization/specialization.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultingRoomRepository } from '../../settings/consulting-room/consulting-room.repository';
import { QueueSystemRepository } from '../queue-system/queue-system.repository';
import { ServiceRepository } from '../../settings/services/repositories/service.repository';
import { TransactionsRepository } from '../../finance/transactions/transactions.repository';
import { ServiceCategoryRepository } from '../../settings/services/repositories/service_category.repository';
import { AppGateway } from '../../../app.gateway';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { ServiceCostRepository } from '../../settings/services/repositories/service_cost.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { AntenatalEnrollmentRepository } from '../../patient/antenatal/enrollment.repository';
import { AntenatalAssessmentRepository } from '../../patient/antenatal/antenatal-assessment.repository';

@Module({
	imports: [TypeOrmModule.forFeature([
		AppointmentRepository,
		PatientRepository,
		DepartmentRepository,
		SpecializationRepository,
		ConsultingRoomRepository,
		QueueSystemRepository,
		ServiceRepository,
		ServiceCategoryRepository,
		TransactionsRepository,
		HmoSchemeRepository,
		ServiceCostRepository,
		StaffRepository,
		AntenatalEnrollmentRepository,
		AntenatalAssessmentRepository,
	])],
	controllers: [AppointmentController],
	providers: [AppGateway, AppointmentService],
})
export class AppointmentModule {
}
