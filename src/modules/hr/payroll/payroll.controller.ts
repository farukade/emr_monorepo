import { Controller, Post, Body, Patch, Get, Param, Request, Query, UseGuards } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { SalaryAllowanceDto } from './dto/salary.allowance.dto';
import { SalaryDeductionDto } from './dto/salary.deduction.dto';
import { GeneratePayrollDto } from './dto/generate.payroll.dto';
import { MakePaymentDto } from './dto/make-payment.dto';
import { UpdatePayslipDto } from './dto/update.payroll.dto';
import { ListPayrollDto } from './dto/list.payroll.dto';
import { SalaryPayment } from './entities/salary_payment.entity';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('hr/payroll')
export class PayrollController {
    constructor(private payrollService: PayrollService) {
    }

    @Get('list-payroll')
    listPayslips(
        @Query() params: string,
    ): Promise<SalaryPayment[]> {
        return this.payrollService.listPayroll(params);
    }

    @Get(':staffId/list')
    listStaffPayroll(@Param() params: string): Promise<SalaryPayment[]> {
        return this.payrollService.listStaffPayroll(params);
    }

    @Post('update-allowances')
    updateAllowances(@Body() salaryAllowanceDto: SalaryAllowanceDto): Promise<any> {
        return this.payrollService.updateSalaryAllowance(salaryAllowanceDto);
    }

    @Post('update-deductions')
    updateDeductions(@Body() salaryDeductionDto: SalaryDeductionDto): Promise<any> {
        return this.payrollService.updateSalaryDeduction(salaryDeductionDto);
    }

    @Post('generate-payslip')
    generatePayroll(
        @Body() generatePayrollDto: GeneratePayrollDto,
        @Request() req,
    ): Promise<any> {
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
