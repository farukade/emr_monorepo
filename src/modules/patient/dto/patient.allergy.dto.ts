import { IsNotEmpty } from 'class-validator';
import { Patient } from '../entities/patient.entity';

export class PatientAllergyDto {
  @IsNotEmpty()
  category: string;

  @IsNotEmpty()
  allergy: string;

  @IsNotEmpty()
  patient_id: string;

  severity: string;

  reaction: string;

  generic_id: any;
}
