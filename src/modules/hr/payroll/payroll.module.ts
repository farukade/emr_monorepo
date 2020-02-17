import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryAllowanceRepository } from './repositories/salary.allowances.repository';
import { SalaryDeductionRepository } from './repositories/salary.deductions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SalaryAllowanceRepository, SalaryDeductionRepository])],
  controllers: [PayrollController],
  providers: [PayrollService],
})
export class PayrollModule {

}
