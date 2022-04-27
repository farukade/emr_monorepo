import { IsNotEmpty } from 'class-validator';

export class ListPayrollDto {
	@IsNotEmpty()
	period: string;

	department_id: string;
}
