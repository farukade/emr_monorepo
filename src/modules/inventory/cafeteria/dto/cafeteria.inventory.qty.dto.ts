import { IsNotEmpty } from 'class-validator';
import { SpawnSyncOptionsWithBufferEncoding } from 'child_process';
import { identity } from 'rxjs';

export class CafeteriaInventoryQtyDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  quantity: string;

}
