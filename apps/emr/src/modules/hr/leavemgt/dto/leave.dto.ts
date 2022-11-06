import { IsNotEmpty } from 'class-validator';

export class LeaveDto {
  @IsNotEmpty()
  start_date: string;

  @IsNotEmpty()
  end_date: string;

  @IsNotEmpty()
  staff_id: string;

  @IsNotEmpty()
  reason: string;

  @IsNotEmpty()
  leave_category_id: string;

  applied_by: string;

  diagnosis_id: string;

  @IsNotEmpty()
  type: string;
}
