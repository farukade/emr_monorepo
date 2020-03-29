import { IsNotEmpty } from 'class-validator';

export class VoucherDto {
    @IsNotEmpty()
    patient_id: string;

    @IsNotEmpty()
    voucher_no: string;

    @IsNotEmpty()
    amount: number;

    transaction_id: string;

    duration: string;
}