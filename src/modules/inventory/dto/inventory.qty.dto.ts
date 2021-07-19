import { IsNotEmpty } from 'class-validator';

export class InventoryQtyDto {
    @IsNotEmpty()
    quantity: number;

    unit_price: any;

    cost_price: any;

}
