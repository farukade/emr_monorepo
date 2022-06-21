import { IsNotEmpty } from 'class-validator';

export class ManufacturerDto {
  @IsNotEmpty()
  name: string;
}
