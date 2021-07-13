import { IsNotEmpty } from 'class-validator';

export class PaymentMethodDto {
    @IsNotEmpty()
    name: string;

    status: number;
}
