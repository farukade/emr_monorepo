import { IsNotEmpty } from "class-validator";

export class UploadRoasterDto {
    @IsNotEmpty()
    department_id: string;

    @IsNotEmpty()
    period: string;
}
