import { IsNotEmpty } from 'class-validator';

export class LabCategoryDto {
  @IsNotEmpty()
  name: string;
}
