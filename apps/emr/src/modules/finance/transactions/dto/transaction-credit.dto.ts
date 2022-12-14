import { CafeteriaFoodItem } from "apps/emr/src/modules/cafeteria/entities/food_item.entity";
import { HmoScheme } from "apps/emr/src/modules/hmo/entities/hmo_scheme.entity";

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
  nicu_id: number;
  staff_id: number;
  lastChangedBy: string;
  foodItems?: CafeteriaFoodItem[]; 
  hmo?: HmoScheme
}
