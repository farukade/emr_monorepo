import { IsNotEmpty } from 'class-validator';
import { CartDto } from './cart.dto';

export class CafeteriaSalesDto {
  @IsNotEmpty()
  customer: string;

  staff_id: string;

  patient_id: string;

  balance: number;

  cartItems: CartDto[];

  @IsNotEmpty()
  paid: number;

  payment_method: string;

  total: number;

  pay_later: string;
}
