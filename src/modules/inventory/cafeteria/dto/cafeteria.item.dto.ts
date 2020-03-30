import { IsNotEmpty } from 'class-validator';
import { SpawnSyncOptionsWithBufferEncoding } from 'child_process';

export class CafeteriaItemDto {
    @IsNotEmpty()
    name: string;

    item_code: string;

    description: string;

    price: number;

    discount_price: number;

    @IsNotEmpty()
    category_id: string;

}
