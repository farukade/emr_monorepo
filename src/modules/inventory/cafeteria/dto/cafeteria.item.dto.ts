import { IsNotEmpty } from 'class-validator';

export class CafeteriaItemDto {
    @IsNotEmpty()
    name: string;

    description: string;

    price: number;

    quantity: number;

}
