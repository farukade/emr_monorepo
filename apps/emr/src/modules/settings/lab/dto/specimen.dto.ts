import { IsNotEmpty } from 'class-validator';

export class SpecimenDto {
  @IsNotEmpty()
  name: string;
}
