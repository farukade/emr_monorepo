import { IsNotEmpty } from 'class-validator';

export class StockDto {
  @IsNotEmpty()
  name: string;

  stock_code: string;

  description: string;

  cost_price: string;

  sales_price: string;

  hmoPrice: string;

  quantity: number;

  @IsNotEmpty()
  category_id: string;

  sub_category_id: string;

  vendor_id: string;

  hmo_id: string;

  expiry_date: string;

}
