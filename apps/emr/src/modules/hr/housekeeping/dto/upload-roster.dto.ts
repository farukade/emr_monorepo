import { IsNotEmpty } from 'class-validator';

export class UploadRosterDto {
  @IsNotEmpty()
  department_id: string;

  @IsNotEmpty()
  period: string;
}
