import { IsNotEmpty } from 'class-validator';

export class ConsumableDto {
  @IsNotEmpty()
  name: string;

  description: string;
}
