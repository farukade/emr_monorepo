import { IsNotEmpty } from 'class-validator';

export class PermissionsDto {
  @IsNotEmpty()
  name: string;
}
