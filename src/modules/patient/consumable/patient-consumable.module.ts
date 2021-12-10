import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientConsumableRepository } from './patient-consumable.repository';
import { PatientConsumableService } from './patient-consumable.service';
import { PatientConsumableController } from './patient-consumable.controller';
import { PatientRepository } from '../repositories/patient.repository';
import { StoreInventoryRepository } from '../../inventory/store/store.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PatientConsumableRepository,
            PatientRepository,
            StoreInventoryRepository,
        ]),
    ],
    providers: [PatientConsumableService],
    controllers: [PatientConsumableController],
})
export class PatientConsumableModule {
}
