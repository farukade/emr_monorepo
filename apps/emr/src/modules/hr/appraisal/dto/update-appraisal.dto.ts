import { IsNotEmpty } from 'class-validator';

export class UpdateAppraisalDto {
  @IsNotEmpty()
  staffId: string;

  @IsNotEmpty()
  lineManagerId: string;

  departmentId: string;

  indicators: IndicatorInterfce[];
}
