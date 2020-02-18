import { IsNotEmpty } from 'class-validator';

export class UpdatePayslipDto {

    @IsNotEmpty()
    payslip_id: string;

    allowances: any;

    deductions: any;

    comment: string;
}
