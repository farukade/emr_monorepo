import { IsNotEmpty } from 'class-validator';

export class SpecializationDto {
  @IsNotEmpty()
  name: string;
}
