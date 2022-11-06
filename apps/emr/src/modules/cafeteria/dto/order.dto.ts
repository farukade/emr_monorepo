import { IsNotEmpty } from 'class-validator';
import { CartDto } from './cart.dto';

export class OrderDto {
  @IsNotEmpty()
  customer: string;

  staff_id: string;

  patient_id: string;

  amount: string;

  cartItems: CartDto[];
}
