import { Injectable } from '@nestjs/common';
import { SalaryAllowanceRepository } from './repositories/salary.allowances.repository';
import { SalaryDeductionRepository } from './repositories/salary.deductions.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { SalaryAllowanceDto } from './dto/salary.allowance.dto';
import { getConnection } from 'typeorm';
import { SalaryDeductionDto } from './dto/salary.deduction.dto';
import { SalaryDeduction } from './entities/salary_deduction.entity';
import { SalaryAllowance } from './entities/salary_allowance.entity';
import { GeneratePayrollDto } from './dto/generate.payroll.dto';

@Injectable()
export class PayrollService {
    constructor(
        @InjectRepository(SalaryAllowanceRepository)
        private salaryAllowanceRepository: SalaryAllowanceRepository,
        @InjectRepository(SalaryDeductionRepository)
        private salaryDeductionRepository: SalaryDeductionRepository,
    ) {
    }

    async updateSalaryAllowance(salaryAllowanceDto: SalaryAllowanceDto): Promise<any> {
        const { items } = salaryAllowanceDto;
        // clear salary allowance table
        // await getConnection().getRepository(SalaryAllowance).clear();
        await this.salaryAllowanceRepository.clear();
        // save items
        try {
            const result = await this.salaryAllowanceRepository.save(items);
            return { success: true, result};
        } catch (err) {
            return { success: false, message: err.mesage };
        }
    }

    async updateSalaryDeduction(salaryDeductionDto: SalaryDeductionDto): Promise<any> {
        const { items } = salaryDeductionDto;
        // clear salary allowance table
        // await getConnection().getRepository(SalaryDeduction).clear();
        await this.salaryDeductionRepository.clear();
        // save items
        try {
            const result = await this.salaryDeductionRepository.save(items);
            return { success: true, result};
        } catch (err) {
            return { success: false, message: err.mesage };
        }
    }

    async generatePayroll(generatePayrollDto: GeneratePayrollDto) {
        
    }
}
