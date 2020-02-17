import { Controller, Post, Body, Patch } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { SalaryAllowanceDto } from './dto/salary.allowance.dto';
import { SalaryAllowance } from './entities/salary_allowance.entity';
import { SalaryDeductionDto } from './dto/salary.deduction.dto';
import { SalaryDeduction } from './entities/salary_deduction.entity';
import { GeneratePayrollDto } from './dto/generate.payroll.dto';
import { MakePaymentDto } from './dto/make-payment.dto';
import { UpdatePayslipDto } from './dto/update.payroll.dto';

@Controller('hr/payroll')
export class PayrollController {
    constructor(private payrollService: PayrollService) {}

    @Post('update-allowances')
    updateAllowances(@Body() salaryAllowanceDto: SalaryAllowanceDto): Promise<any> {
        return this.payrollService.updateSalaryAllowance(salaryAllowanceDto);
    }

    @Post('update-deductions')
    updateDeductions(@Body() salaryDeductionDto: SalaryDeductionDto): Promise<any> {
        return this.payrollService.updateSalaryDeduction(salaryDeductionDto);
    }

    @Post('generate-payslip')
    generatePayroll(@Body() generatePayrollDto: GeneratePayrollDto): Promise<any> {
        return this.payrollService.generatePayroll(generatePayrollDto);
    }

    @Post('make-payment')
    makePayment(@Body() makePaymentDto: MakePaymentDto): Promise<any> {
        return this.payrollService.makePayments(makePaymentDto);
    }

    @Patch('update-payslip')
    updatePayslip(@Body() updatePayslipDto: UpdatePayslipDto): Promise<any> {
        return this.payrollService.updatePayslip(updatePayslipDto);
    }
}
