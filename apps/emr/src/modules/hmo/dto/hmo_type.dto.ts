import { IsNotEmpty } from 'class-validator';

export class HmoTypeDto {
  @IsNotEmpty()
  name: string;
}
