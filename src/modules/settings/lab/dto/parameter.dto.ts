import { IsNotEmpty } from 'class-validator';

export class ParameterDto {
  @IsNotEmpty()
  name: string;
}
