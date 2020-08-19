import { IsNotEmpty } from 'class-validator';

export class DiagnosisUpdateDto {
  @IsNotEmpty()
  procedureCode: string;

  @IsNotEmpty()
  icd10Code: string;

  description: string;

  diagnosisType: string;

}
