import { IsNotEmpty } from 'class-validator';

export class SalaryDeductionDto {
	items: DeductionInterface[];
}
