import { Module } from '@nestjs/common';
import { TransactionModule } from './transactions/transaction.module';
import { VouchersModule } from './vouchers/vouchers.module';

@Module({
  imports: [TransactionModule, VouchersModule]
})
export class FinanceModule {}
