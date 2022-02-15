import { IsNotEmpty, IsEmail } from 'class-validator';

export class OpdPatientDto {

    @IsNotEmpty()
    surname: string;

    @IsNotEmpty()
    other_names: string;

    @IsNotEmpty()
    date_of_birth: string;

    address: string;

    @IsEmail()
    email: string;

    phone_number: string;

    gender: string;
}
