import { IsNotEmpty } from 'class-validator';

export class CafeteriaInventoryCategoryDto {
  @IsNotEmpty()
  name: string;
}
