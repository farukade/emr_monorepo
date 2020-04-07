import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsRepository } from './transactions.repository';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { ServiceRepository } from '../../settings/services/service.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { VoucherRepository } from '../vouchers/voucher.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { QueueSystemRepository } from '../../frontdesk/queue-system/queue-system.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        TransactionsRepository,
        PatientRepository,
        DepartmentRepository,
        ServiceRepository,
        VoucherRepository,
        StaffRepository,
        QueueSystemRepository,
    ])],
    controllers: [TransactionsController],
    providers: [TransactionsService],
})
export class TransactionModule {}
