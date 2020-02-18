import { IsNotEmpty } from 'class-validator';

export class ServiceSubCategoryDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  service_category_id: string;
}
