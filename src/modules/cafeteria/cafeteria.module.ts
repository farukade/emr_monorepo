import { Module } from '@nestjs/common';
import { CafeteriaService } from './cafeteria.service';
import { CafeteriaController } from './cafeteria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CafeteriaItemRepository } from './repositories/cafeteria.item.repository';
import { CafeteriaFoodItemRepository } from './repositories/cafeteria.food-item.repository';
import { StaffRepository } from '../hr/staff/staff.repository';
import { PatientRepository } from '../patient/repositories/patient.repository';
import { AdmissionsRepository } from '../patient/admissions/repositories/admissions.repository';
import { NicuRepository } from '../patient/nicu/nicu.repository';
import { PaymentMethodRepository } from '../settings/payment-methods/pm.repository';
import { HmoSchemeRepository } from '../hmo/repositories/hmo_scheme.repository';
import { OrderRepository } from './repositories/order.repository';
import { TransactionsRepository } from '../finance/transactions/transactions.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CafeteriaItemRepository,
      CafeteriaFoodItemRepository,
      StaffRepository,
      PatientRepository,
      AdmissionsRepository,
      NicuRepository,
      PaymentMethodRepository,
      HmoSchemeRepository,
      OrderRepository,
      TransactionsRepository,
    ]),
  ],
  providers: [CafeteriaService],
  controllers: [CafeteriaController],
})
export class CafeteriaModule {}
