import { IsNotEmpty } from 'class-validator';

export class CreateAppriasalDto {
	@IsNotEmpty()
	staffId: string;

	@IsNotEmpty()
	lineManagerId: string;

	departmentId: string;

	indicators: IndicatorInterfce[];
}
