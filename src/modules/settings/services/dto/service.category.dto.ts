import { IsNotEmpty } from 'class-validator';

export class ServiceCategoryDto {
  @IsNotEmpty()
  name: string;

}
