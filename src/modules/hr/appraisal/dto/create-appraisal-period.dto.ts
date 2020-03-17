import { IsNotEmpty } from "class-validator";

export class CreateAppriasalPeriodDto {

    @IsNotEmpty()
    performancePeriod: string;

    @IsNotEmpty()
    startDate: string;

    @IsNotEmpty()
    endDate: string;

    id: string;
}
