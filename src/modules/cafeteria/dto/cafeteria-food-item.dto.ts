import { IsNotEmpty } from 'class-validator';

export class CafeteriaFoodItemDto {
	@IsNotEmpty()
	name: string;

	description: string;

}
