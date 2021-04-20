import { IsNotEmpty } from 'class-validator';

export class AntenatalPackageDto {
  @IsNotEmpty()
  name: string;

  description: string;

  amount: number;
}
