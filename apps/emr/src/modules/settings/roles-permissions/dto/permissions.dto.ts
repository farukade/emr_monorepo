import { IsNotEmpty } from 'class-validator';

export class PermissionsDto {
  @IsNotEmpty()
  name: string;

  category_id: any;
}
