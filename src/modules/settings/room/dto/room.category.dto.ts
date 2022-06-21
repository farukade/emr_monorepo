import { IsNotEmpty } from 'class-validator';

export class RoomCategoryDto {
  @IsNotEmpty()
  name: string;
  tariff: string;
  hmo_id: string;
}
