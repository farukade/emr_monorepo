import { IsNotEmpty } from 'class-validator';

export class HmoDto {

    @IsNotEmpty()
    name: string;

    address: string;

    phoneNumber: string;

    email: any;
}
