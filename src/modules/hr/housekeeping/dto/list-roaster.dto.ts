import { IsNotEmpty } from "class-validator";

export class ListRoasterDto {
    @IsNotEmpty()
    department_id: string;

    @IsNotEmpty()
    period: string;
}
