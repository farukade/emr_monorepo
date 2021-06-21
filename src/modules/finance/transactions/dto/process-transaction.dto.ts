import { IsNotEmpty } from "class-validator";

export class ProcessTransactionDto {

    voucher_id: number;

    patient_id: number;

    @IsNotEmpty()
    amount_paid: number;

    voucher_amount: number;

    @IsNotEmpty()
    payment_type: string;

    is_part_payment: number;
}
