import { Module } from '@nestjs/common';
import { TransactionModule } from './transactions/transaction.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { SetupController } from './setup/setup.controller';
import { SetupService } from './setup/setup.service';

@Module({
    imports: [TransactionModule, VouchersModule],
    controllers: [SetupController],
    providers: [SetupService],
})
export class FinanceModule {
}
