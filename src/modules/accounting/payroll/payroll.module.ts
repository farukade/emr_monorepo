import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryAllowanceRepository } from './repositories/salary.allowances.repository';
import { SalaryDeductionRepository } from './repositories/salary.deductions.repository';
import { SalaryPaymentRepository } from './repositories/salary.payments.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { SalaryPaymentAllowanceRepository } from './repositories/salary.payment.allowances.repository';
import { SalaryPaymentDeductionRepository } from './repositories/salary.payment.deductions.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalaryAllowanceRepository,
      SalaryDeductionRepository,
      SalaryPaymentRepository,
      StaffRepository,
      SalaryPaymentAllowanceRepository,
      SalaryPaymentDeductionRepository,
      DepartmentRepository,
    ]),
  ],
  controllers: [PayrollController],
  providers: [PayrollService],
})
export class PayrollModule {}
