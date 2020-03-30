import { IsNotEmpty } from 'class-validator';

export class CafeteriaItemCategoryDto {
  @IsNotEmpty()
  name: string;
}
