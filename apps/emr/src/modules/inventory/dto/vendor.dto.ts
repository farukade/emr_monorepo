import { IsNotEmpty } from 'class-validator';

export class VendorDto {
  @IsNotEmpty()
  name: string;
}
