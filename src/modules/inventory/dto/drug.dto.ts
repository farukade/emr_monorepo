import { IsNotEmpty } from 'class-validator';

export class DrugDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  generic_id: any;

  unitOfMeasure: any;

  manufacturer_id: any;
}
