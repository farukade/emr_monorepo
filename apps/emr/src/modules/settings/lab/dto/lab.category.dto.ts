import { IsNotEmpty, IsNumber } from 'class-validator';

export class LabCategoryDto {
  @IsNotEmpty()
  name: string;

  @IsNumber()
  duration: number;
}
