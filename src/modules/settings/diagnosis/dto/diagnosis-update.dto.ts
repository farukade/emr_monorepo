import { IsNotEmpty } from 'class-validator';

export class DiagnosisUpdateDto {
  @IsNotEmpty()
  code: string;

  description: string;

  type: string;
}
