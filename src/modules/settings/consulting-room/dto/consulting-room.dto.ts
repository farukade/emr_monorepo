import { IsNotEmpty } from 'class-validator';

export class ConsultingRoomDto {
  @IsNotEmpty()
  name: string;

}
