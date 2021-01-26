import { IsNotEmpty } from 'class-validator';

export class RoomCategoryDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    price: string;

    hmo_id: number;

    hmo_tarrif: string;
}
