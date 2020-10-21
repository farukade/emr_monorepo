import { IsNotEmpty } from 'class-validator';
import { SpawnSyncOptionsWithBufferEncoding } from 'child_process';
import { identity } from 'rxjs';

export class StockQtyDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  quantity: number;

}
