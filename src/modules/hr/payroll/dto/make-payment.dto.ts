import { IsNotEmpty } from 'class-validator';

export class MakePaymentDto {

    @IsNotEmpty()
    staffIds: any;

    @IsNotEmpty()
    payment_month: string;
}
