import { Module } from '@nestjs/common';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherRepository } from './voucher.repository';
import { PatientRepository } from '../../patient/repositories/patient.repository';
import { TransactionsRepository } from '../transactions/transactions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([VoucherRepository, PatientRepository, TransactionsRepository])],
  controllers: [VouchersController],
  providers: [VouchersService],
})
export class VouchersModule {}
