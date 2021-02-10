import { IsNotEmpty } from "class-validator";

export class TransactionDto {
   
    patient_id: string;

    
    serviceType: string[];

    
    amount: number;

 
    payment_type: string;

    description: string;

    hmo_approval_code: string;
}
