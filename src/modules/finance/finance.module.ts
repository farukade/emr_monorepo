import { Module } from '@nestjs/common';
import { PaypointModule } from './paypoint/paypoint.module';

@Module({
  imports: [PaypointModule]
})
export class FinanceModule {}
