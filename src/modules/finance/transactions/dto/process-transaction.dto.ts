import { IsNotEmpty } from "class-validator";

export class ProcessTransactionDto {

    voucher_id: string;

    @IsNotEmpty()
    amount_paid: number;

    voucher_amount: number;

    @IsNotEmpty()
    payment_type: string;
}