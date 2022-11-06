import { IsNotEmpty } from 'class-validator';

export class AccommodationDto {
  @IsNotEmpty()
  name: string;

  description: string;

  amount: number;

  quantity: number;
}
