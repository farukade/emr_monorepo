import { IsNotEmpty } from 'class-validator';

export class ServiceCostDto {
  @IsNotEmpty()
  service_id: string;

  hmo_id: string;

  tariff: any;
}
