import { IsNotEmpty } from 'class-validator';
import { SpawnSyncOptionsWithBufferEncoding } from 'child_process';
import { identity } from 'rxjs';

export class StockUploadDto {
  @IsNotEmpty()
  category_id: string;

  @IsNotEmpty()
  file: string;

  vendor_id: string;

}
