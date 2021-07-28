import { IsNotEmpty } from 'class-validator';

export class ServiceDto {
    @IsNotEmpty()
    name: string;

    category_id: string;

    hmo_id: any;

    code: string;

    tariff: any;

}
