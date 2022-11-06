import { IsNotEmpty } from 'class-validator';

export class RoomDto {
  @IsNotEmpty()
  name: string;

  floor: string;

  room_category_id: string;
}
