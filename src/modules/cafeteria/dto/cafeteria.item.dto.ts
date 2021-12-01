import { IsNotEmpty } from 'class-validator';

export class CafeteriaItemDto {
	@IsNotEmpty()
	item_id: number;

	price: number;

	quantity: number;

}
