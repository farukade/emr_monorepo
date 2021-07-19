import { IsNotEmpty } from 'class-validator';

export class DrugGenericDto {
    @IsNotEmpty()
    name: string;
}
