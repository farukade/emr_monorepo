import { IsNotEmpty } from "class-validator";

export class DownloadRoasterDto {
    @IsNotEmpty()
    department_id: string;

    @IsNotEmpty()
    period: string;
}
