import { IsNotEmpty } from 'class-validator';

export class LabTestDto {

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    price: string;

    @IsNotEmpty()
    lab_category_id: string;

    test_type: string;

    parameters: any;

    specimens: any;

    description: string;

    hasParameters: boolean;
}
