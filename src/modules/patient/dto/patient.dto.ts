import { IsNotEmpty } from "class-validator";

export class PatientDto {

    @IsNotEmpty()
    surname: string;

    @IsNotEmpty()
    other_names: string;
    
    @IsNotEmpty()
    date_of_birth: string;

    occupation: string;

    address: string;

    email: string;

    phoneNumber: string;

    gender: string;

    maritalStatus: string;

    ethnicity: string;

    insurranceStatus: string;

    referredBy: string;

    nok_surname: string;

    nok_other_names: string;

    nok_date_of_birth: string;

    nok_occupation: string;

    nok_address: string;

    nok_email: string;

    nok_phoneNumber: string;

    nok_gender: string;

    nok_maritalStatus: string;

    nok_ethnicity: string;
}