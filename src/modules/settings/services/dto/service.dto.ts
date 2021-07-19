import { IsNotEmpty } from 'class-validator';

export class ServiceDto {
    @IsNotEmpty()
    name: string;

    category_id: string;

    code: string;

}
