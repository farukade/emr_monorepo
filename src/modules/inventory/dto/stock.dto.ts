import { IsNotEmpty } from 'class-validator';
import { SpawnSyncOptionsWithBufferEncoding } from 'child_process';

export class StockDto {
  @IsNotEmpty()
  name: string;

  stock_code: string;
  
  description: string;

  cost_price: string;

  sales_price: string;

  quantity: string;

  @IsNotEmpty()
  category_id: string;

  sub_category_id: string;

}
