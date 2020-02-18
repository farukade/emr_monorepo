import { IsNotEmpty } from 'class-validator';

export class InventoryCategoryDto {
  @IsNotEmpty()
  name: string;
}
