import { IsNotEmpty } from 'class-validator';
import { SpawnSyncOptionsWithBufferEncoding } from 'child_process';

export class CafeteriaInventoryDto {
    @IsNotEmpty()
    name: string;

    stock_code: string;

    description: string;

    cost_price: string;

    quantity: string;

    @IsNotEmpty()
    category_id: string;

}
