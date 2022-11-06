import { IsNotEmpty } from 'class-validator';

export class ExcuseDutyDto {
  @IsNotEmpty()
  patient_id: number;

  comment: string;

  start_date: string;

  end_date: string;

  diagnoses: any;
}
