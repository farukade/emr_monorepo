import { IsNotEmpty } from 'class-validator';

export class CafeteriaFoodItemDto {
  @IsNotEmpty()
  name: string;

  description: string;

  price: number;

  discount_price: number;

  staff_price: number;

  unit: string;
}
