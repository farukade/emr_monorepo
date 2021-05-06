import { IsNotEmpty } from 'class-validator';

export class CafeteriaSalesDto {
    @IsNotEmpty()
    user_type: string;

    user_id: string;

    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    amount_paid: number;

    balance: number;

    payment_type: string;

    items: any[];
}
