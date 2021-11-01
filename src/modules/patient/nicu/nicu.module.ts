import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NicuService } from './nicu.service';
import { NicuController } from './nicu.controller';
import { NicuRepository } from './nicu.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { NicuAccommodationRepository } from '../../settings/nicu-accommodation/accommodation.repository';
import { TransactionsRepository } from '../../finance/transactions/transactions.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        NicuRepository,
        PatientRepository,
        StaffRepository,
        AdmissionsRepository,
        NicuAccommodationRepository,
        TransactionsRepository,
    ])],
    controllers: [NicuController],
    providers: [NicuService],
})
export class NicuModule {
}
