import { IsNotEmpty } from 'class-validator';

export class CafeteriaSalesDto {
    @IsNotEmpty()
    user_type: string;

    user_id: string;

    sub_total: number;

    vat: number;

    total_amount: number;

    @IsNotEmpty()
    amount_paid: number;

    change: number;

    payment_type: string;

    items: any[];
}
