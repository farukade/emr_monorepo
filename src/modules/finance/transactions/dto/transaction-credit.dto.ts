export class TransactionCreditDto {
    patient_id: number;
    username: string;
    sub_total: number;
    vat: number;
    amount: number;
    voucher_amount: number;
    amount_paid: number;
    change: number;
    description: string;
    payment_method: string;
    part_payment_expiry_date: string;
    bill_source: string;
    next_location: string;
    status: number;
    hmo_approval_code: string;
    transaction_details: any;
    admission_id: number;
    staff_id: number;
    lastChangedBy: string;
}
