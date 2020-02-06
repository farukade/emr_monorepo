import { IsNotEmpty } from 'class-validator';

export class InventorySubCategoryDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  inventory_category_id: string;
}
