import { IsNotEmpty } from 'class-validator';

export class InventoryDto {
  name: string;

  drug_id: number;

  description: string;

  @IsNotEmpty()
  quantity: number;

  unit_price: any;

  cost_price: any;

  expiry_date: string;

  vendor_id: number;

}
