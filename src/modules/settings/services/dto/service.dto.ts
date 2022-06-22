import { IsNotEmpty } from 'class-validator';

export class ServiceDto {
  @IsNotEmpty()
  name: string;

  category_id: string;

  hmo_id: any;

  tariff: any;

  update_tariff: any;
}
