import { IsNotEmpty } from "class-validator";

export class CreateEvaluationDto {

    @IsNotEmpty()
    performancePeriod: string;

    @IsNotEmpty()
    startDate: string;

    @IsNotEmpty()
    endDate: string;

    id: string;
}
