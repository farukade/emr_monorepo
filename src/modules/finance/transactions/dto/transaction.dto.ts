import { IsNotEmpty } from "class-validator";

export class TransactionDto {
    @IsNotEmpty()
    patient_id: string

    @IsNotEmpty()
    department_id: string;

    @IsNotEmpty()
    serviceType: string;

    @IsNotEmpty()
    amount: number;

    description: string;
}