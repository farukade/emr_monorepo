import { IsNotEmpty } from 'class-validator';

export class RequestTypeDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  group: string;

}
