import { IsNotEmpty, IsNumber } from 'class-validator';

export class LabCategoryDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  duration: number;
}
