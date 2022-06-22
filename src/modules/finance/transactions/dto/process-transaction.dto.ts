export class ProcessTransactionDto {
  voucher_id: number;

  patient_id: number;

  amount_paid: number;

  voucher_amount: number;

  payment_method: string;

  items: any;

  expiry_date: string;
}
