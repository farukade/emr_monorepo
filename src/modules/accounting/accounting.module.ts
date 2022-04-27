import { Module } from '@nestjs/common';
import {PayrollModule} from './payroll/payroll.module';

@Module({
    imports: [
        PayrollModule,
    ],
    controllers: [],
})
export class AccountingModule {}
