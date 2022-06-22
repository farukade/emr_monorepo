import { IsNotEmpty } from 'class-validator';

export class GeneratePayrollDto {
  @IsNotEmpty()
  payment_month: string;
}
