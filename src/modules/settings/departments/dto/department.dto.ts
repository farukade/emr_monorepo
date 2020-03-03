import { IsNotEmpty } from 'class-validator';

export class DepartmentDto {
  @IsNotEmpty()
  name: string;

  description: string;

  hod_id: string;
}
