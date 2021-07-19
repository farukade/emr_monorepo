import { IsNotEmpty } from 'class-validator';

export class DrugDto {
    @IsNotEmpty()
    name: string;
}
