import { IsNotEmpty } from 'class-validator';

export class RequisitionDto {
    @IsNotEmpty()
    name: string;
}
