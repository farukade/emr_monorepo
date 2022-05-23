import { IsNotEmpty } from 'class-validator';
import { CartDto } from './cart.dto';

export class CafeteriaSalesDto {
  @IsNotEmpty()
  customer: string;

  staff_id: string;

  patient_id: string;

  balance: string;

  cartItems: CartDto[];

  @IsNotEmpty()
  paid: number;

  payment_method: string;

  staff_total: number;

  total: number;
}
