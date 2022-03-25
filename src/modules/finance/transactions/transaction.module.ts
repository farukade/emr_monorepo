import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsRepository } from './transactions.repository';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { ServiceRepository } from '../../settings/services/repositories/service.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { VoucherRepository } from '../vouchers/voucher.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { QueueSystemRepository } from '../../frontdesk/queue-system/queue-system.repository';
import { AppointmentRepository } from '../../frontdesk/appointment/appointment.repository';
import { AppGateway } from '../../../app.gateway';
import { ServiceCostRepository } from '../../settings/services/repositories/service_cost.repository';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { PatientRequestItemRepository } from '../../patient/repositories/patient_request_items.repository';
import { PatientRequestRepository } from '../../patient/repositories/patient_request.repository';
import { AdmissionsRepository } from 'src/modules/patient/admissions/repositories/admissions.repository';
import { ServiceCategoryRepository } from '../../settings/services/repositories/service_category.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        AppointmentRepository,
        TransactionsRepository,
        PatientRepository,
        DepartmentRepository,
        ServiceRepository,
        VoucherRepository,
        StaffRepository,
        QueueSystemRepository,
        ServiceCostRepository,
        HmoSchemeRepository,
        PatientRequestItemRepository,
        PatientRequestRepository,
        AdmissionsRepository,
        ServiceCategoryRepository,
    ])],
    controllers: [TransactionsController],
    providers: [AppGateway, TransactionsService],
})
export class TransactionModule {
}
