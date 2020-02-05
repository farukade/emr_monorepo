import { IsNotEmpty } from 'class-validator';

export class RoomDto {
  @IsNotEmpty()
  name: string;

  status: string;

  room_category_id: string;

}
