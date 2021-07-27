import { IsNotEmpty } from 'class-validator';

export class LabTestDto {

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    lab_category_id: string;

    parameters: any;

    specimens: any;

    hasParameters: boolean;

    hmo_id: any;
}
