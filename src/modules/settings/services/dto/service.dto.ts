import { IsNotEmpty } from 'class-validator';

export class ServiceDto {
  @IsNotEmpty()
  name: string;

  tariff: string;

  service_category_id: string;

}
