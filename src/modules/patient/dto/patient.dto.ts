import { IsNotEmpty, IsEmail } from 'class-validator';

export class PatientDto {

    @IsNotEmpty()
    surname: string;

    @IsNotEmpty()
    other_names: string;

    @IsNotEmpty()
    date_of_birth: string;

    occupation: string;

    address: string;

    @IsEmail()
    email: string;

    phoneNumber: string;

    gender: string;

    maritalStatus: string;

    ethnicity: string;

    hmoId: string;

    avatar: string;

    referredBy: string;

    @IsNotEmpty()
    nok_surname: string;

    @IsNotEmpty()
    nok_other_names: string;

    nok_date_of_birth: string;

    relationship: string;

    nok_occupation: string;

    nok_address: string;

    @IsEmail()
    nok_email: string;

    nok_phoneNumber: string;

    nok_gender: string;

    nok_maritalStatus: string;

    nok_ethnicity: string;

    admitTo: string;

    folderNumber: string;
}
