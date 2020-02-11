import { IsNotEmpty } from 'class-validator';

export class StaffDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;
}
