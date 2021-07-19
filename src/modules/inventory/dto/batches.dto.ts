import { IsNotEmpty } from 'class-validator';

export class DrugBatchDto {
    @IsNotEmpty()
    name: string;
}
