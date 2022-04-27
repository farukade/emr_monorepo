import { Injectable } from '@nestjs/common';
import { SalaryAllowanceRepository } from './repositories/salary.allowances.repository';
import { SalaryDeductionRepository } from './repositories/salary.deductions.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { SalaryAllowanceDto } from './dto/salary.allowance.dto';
import { SalaryDeductionDto } from './dto/salary.deduction.dto';
import { GeneratePayrollDto } from './dto/generate.payroll.dto';
import { SalaryPaymentRepository } from './repositories/salary.payments.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { MakePaymentDto } from './dto/make-payment.dto';
import { UpdatePayslipDto } from './dto/update.payroll.dto';
import { SalaryPayment } from './entities/salary_payment.entity';
import { SalaryPaymentAllowanceRepository } from './repositories/salary.payment.allowances.repository';
import { SalaryPaymentDeductionRepository } from './repositories/salary.payment.deductions.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';

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
		@InjectRepository(DepartmentRepository)
		private departmentRepository: DepartmentRepository,
	) {}

	async listPayroll(options: PaginationOptionsInterface, params): Promise<Pagination> {
		try {
			const { department_id, period, status } = params;

			const page = options.page - 1;

			const query = this.salaryPaymentRepository
				.createQueryBuilder('p')
				.select('p.*')
				.where('p.payment_month = :period', { period });

			if (department_id && department_id !== '') {
				query.andWhere('p.department_id = :department_id', { department_id });
			}

			if (status && status !== '') {
				query.andWhere('p.status = :status', { status });
			}

			const rs = await query
				.offset(page * options.limit)
				.limit(options.limit)
				.orderBy('p.createdAt', 'DESC')
				.getRawMany();

			const total = await query.getCount();

			let results = [];
			for (const item of rs) {
				item.staff = await this.staffRepository.findOne(item.staff_id);
				item.department = await this.departmentRepository.findOne(item.department_id);

				results = [...results, item];
			}

			return {
				result: results,
				lastPage: Math.ceil(total / options.limit),
				itemsPerPage: options.limit,
				totalPages: total,
				currentPage: options.page,
			};
		} catch (e) {
			console.log(e);
			throw e;
		}
	}

	async listStaffPayroll(params: any): Promise<SalaryPayment[]> {
		const { staffId } = params;
		const staff = await this.staffRepository.findOne(staffId);

		return await this.salaryPaymentRepository.find({ where: { staff, status: 1 } });
	}

	async updateSalaryAllowance(salaryAllowanceDto: SalaryAllowanceDto): Promise<any> {
		const { items } = salaryAllowanceDto;
		// clear salary allowance table
		// await getConnection().getRepository(SalaryAllowance).clear();
		await this.salaryAllowanceRepository.clear();
		// save items
		try {
			const result = await this.salaryAllowanceRepository.save(items);
			return { success: true, result };
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
			return { success: true, result };
		} catch (err) {
			return { success: false, message: err.mesage };
		}
	}

	async generatePayroll(generatePayrollDto: GeneratePayrollDto): Promise<SalaryPayment[]> {
		try {
			const { payment_month } = generatePayrollDto;

			// check if payroll exists for the given period
			let payroll = await this.salaryPaymentRepository.find({
				where: { payment_month },
				relations: ['allowances', 'deductions', 'staff', 'department'],
			});

			if (!payroll.length) {
				// fetch all staffs
				const staffs = await this.staffRepository.find({ relations: ['department'] });

				const payrollData = [];
				for (const staff of staffs) {
					const monthly_salary = staff.monthly_salary || '0';
					if (!staff.monthly_salary) {
						staff.monthly_salary = '0';
						await staff.save();
					}

					const salary_amount = monthly_salary.replace(',', '');

					// get default deductions
					const deductions = await this.salaryDeductionRepository.find();
					let totalDeductions = 0;
					if (deductions.length) {
						// calculate deductions
						for (const deduction of deductions) {
							totalDeductions += (parseFloat(salary_amount) * deduction.value) / 100;
						}
					}

					if (staff.department) {
						payrollData.push({
							staff_name: `${staff.first_name} ${staff.last_name}`,
							staff,
							department: staff.department,
							total_allowance: salary_amount,
							total_deduction: totalDeductions,
							amount_paid: parseFloat(salary_amount) - totalDeductions,
							payment_month,
						});
					}
				}

				payroll = await this.salaryPaymentRepository.save(payrollData);
			}

			return payroll;
		} catch (e) {
			console.log(e);
			throw e;
		}
	}

	async makePayments(makePaymentDto: MakePaymentDto) {
		const { staffIds, payment_month } = makePaymentDto;

		if (staffIds.length) {
			for (const id of staffIds) {
				const staff = await this.staffRepository.findOne(id);
				const payroll = await this.salaryPaymentRepository.findOne({ where: { staff, payment_month, status: 0 } });
				if (payroll) {
					payroll.status = 1;
					payroll.save();
				}
			}
			return { success: true };
		} else {
			throw { success: false, message: 'Please select at least one staff' };
		}
	}

	async updatePayslip(updatePayslipDto: UpdatePayslipDto) {
		const { payslip_id, allowances, deductions, comment } = updatePayslipDto;

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
			return { success: false, message: err.message };
		}
	}

	async savePayslipAllowances(allowances, payslip) {
		await this.salaryPaymentAllowanceRepository
			.createQueryBuilder()
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
		await this.salaryPaymentDeductionRepository
			.createQueryBuilder()
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
}
