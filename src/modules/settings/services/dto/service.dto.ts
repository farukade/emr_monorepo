import { IsNotEmpty } from 'class-validator';

export class ServiceDto {
  @IsNotEmpty()
  name: string;

  tariff: string;

  sub_category_id: string;
  
  category_id: string;

  noOfVisits: number;

  gracePeriod: string;

  note: string;

}
