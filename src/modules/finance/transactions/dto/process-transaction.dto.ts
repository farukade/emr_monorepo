
export class ProcessTransactionDto {

    voucher_id: number;

    patient_id: number;

    amount_paid: number;

    voucher_amount: number;

    payment_method: string;

    is_part_payment: number;

    pay_with_credit: number;

    items: any;

    partAmount: number;

    expiry_date: string;
}
