import { IsNotEmpty } from 'class-validator';

export class HmoSchemeDto {

    @IsNotEmpty()
    name: string;

    hmo_id: string;

    hmo: any;

    hmo_type_id: string;

    address: string;

    phoneNumber: string;

    email: any;

    cacNumber: string;

    coverageType: string;

    logo: string;

    coverage: any;

}
