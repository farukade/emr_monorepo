import { IsNotEmpty } from 'class-validator';

export class RoomCategoryDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  price: string;

  discount: string;

}
