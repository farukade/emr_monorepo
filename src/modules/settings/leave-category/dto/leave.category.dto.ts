import { IsNotEmpty } from 'class-validator';

export class LeaveCategoryDto {
  @IsNotEmpty()
  name: string;
}
