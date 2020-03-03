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
import { SalaryPaymentRepository } from './repositories/salary.payments.repository';
import { StaffRepository } from '../staff/staff.repository';
import { Department } from '../../settings/entities/department.entity';
import { MakePaymentDto } from './dto/make-payment.dto';
import { UpdatePayslipDto } from './dto/update.payroll.dto';
import { SalaryPayment } from './entities/salary_payment.entity';
import { SalaryPaymentAllowanceRepository } from './repositories/salary.payment.allowances.repository';
import { SalaryPaymentDeductionRepository } from './repositories/salary.payment.deductions.repository';
import { ListPayrollDto } from './dto/list.payroll.dto';

@Injectable()
export class PayrollService {
    constructor(
        @InjectRepository(SalaryAllowanceRepository)
        private salaryAllowanceRepository: SalaryAllowanceRepository,
        @InjectRepository(SalaryDeductionRepository)
        private salaryDeductionRepository: SalaryDeductionRepository,
        @InjectRepository(SalaryPaymentRepository)
        private salaryPaymentRepository: SalaryPaymentRepository,
        @InjectRepository(SalaryPaymentAllowanceRepository)
        private salaryPaymentAllowanceRepository: SalaryPaymentAllowanceRepository,
        @InjectRepository(SalaryPaymentDeductionRepository)
        private salaryPaymentDeductionRepository: SalaryPaymentDeductionRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
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

    async generatePayroll(generatePayrollDto: GeneratePayrollDto): Promise<SalaryPayment[]> {
        const { payment_month } = generatePayrollDto;
        // check if payroll exists for the given period
        let payroll = await this.salaryPaymentRepository.find({ where: {payment_month}, relations: ['allowances', 'deductions']});

        if (!payroll.length) {

            // fetch all staffs
            const staffs = await this.staffRepository.createQueryBuilder('staff')
                                .innerJoin(Department, 'dept', 'staff.department_id = dept.id')
                                .select(['first_name, last_name, emp_code, monthly_salary'])
                                .addSelect('dept.name, dept.id')
                                .getRawMany();
            const payrollData = [];
            for (const staff of staffs) {
                // get default deductions
                const deductions = await this.getDeductions();
                let totalDeductions = 0;
                if (deductions.length) {
                    // calculate deductions
                    for (const deduction of deductions) {
                        totalDeductions += ((staff.monthly_salary * deduction.value) / 100);
                    }
                }
                payrollData.push({
                    emp_code: staff.emp_code,
                    staff_name: staff.first_name + ' ' + staff.last_name,
                    department: staff.name,
                    department_id: staff.id,
                    total_allowance: staff.monthly_salary,
                    total_deduction: totalDeductions,
                    amount_paid: staff.monthly_salary - totalDeductions,
                    payment_month,
                });
            }
            payroll = await this.salaryPaymentRepository.save(payrollData);
        }

        return payroll;
    }

    async makePayments(makePaymentDto: MakePaymentDto) {
        const { staffIds, payment_month } = makePaymentDto;

        if (staffIds.length) {
            for (const id of staffIds) {
                const payroll = await this.salaryPaymentRepository.findOne({where: {emp_code: id, payment_month, status: 0}});
                if (payroll) {
                    payroll.status = 1;
                    payroll.save();
                }
            }
            return {success: true };
        } else {
            throw {success: false, message: 'Please select at least one staff'};
        }
    }

    async updatePayslip(updatePayslipDto: UpdatePayslipDto) {
        const { payslip_id, allowances, deductions, comment  } = updatePayslipDto;

        try {
            const payslip = await this.salaryPaymentRepository.findOne(payslip_id);
            payslip.comment = comment;
            await payslip.save();

            if (allowances) {
                await this.savePayslipAllowances(allowances, payslip);
            }

            if (deductions) {
                await this.savePayslipDeductions(deductions, payslip);
            }
            return { successs: true };
        } catch (err) {
            return {success: false, message: err.message };
        }

    }

    async savePayslipAllowances(allowances, payslip) {
        await this.salaryPaymentAllowanceRepository.createQueryBuilder()
        .delete()
        .where('salary_payment_id = :id', { id: payslip.id })
        .execute();

        for (const allowance of allowances) {
            await this.salaryPaymentAllowanceRepository.save({
                label: allowance.label,
                value: allowance.value,
                payment: payslip,
            });
        }
    }

    async savePayslipDeductions(deductions, payslip) {
        await this.salaryPaymentDeductionRepository.createQueryBuilder()
        .delete()
        .where('salary_payment_id = :id', { id: payslip.id })
        .execute();

        for (const deduction of deductions) {
            await this.salaryPaymentDeductionRepository.save({
                label: deduction.label,
                value: deduction.value,
                payment: payslip,
            });
        }
    }

    async listPayroll(listPayrollDto: ListPayrollDto): Promise<SalaryPayment[]> {
        const {department_id, period} = listPayrollDto;

        const query = this.salaryPaymentRepository.createQueryBuilder('payroll')
                            .where('payroll.payment_month = :payment_month', { payment_month: period});
        if (department_id !== '') {
            query.andWhere('payroll.department_id = department_id', { department_id });
        }
        const results = await query.getMany();

        return results;
    }

    async listStaffPayroll(id: string): Promise<SalaryPayment[]> {
        const staff = await this.staffRepository.findOne(id);

        const query = this.salaryPaymentRepository.createQueryBuilder('payroll')
                            .where('payroll.emp_code = :emp_code', { emp_code: staff.emp_code});

        const results = await query.getMany();

        return results;
    }

    async getDeductions() {
        return await this.salaryDeductionRepository.find();
    }
}
