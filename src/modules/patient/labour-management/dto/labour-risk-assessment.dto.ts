import { IsNotEmpty } from 'class-validator';
import { LabourEnrollment } from '../entities/labour_enrollment.entity';

export class LabourRistAssesmentDto {
  height: string;

  weight: string;

  previousPregnancyOutcome: string;

  previousPregnancyExperience: string[];

  note: string;

  createdBy: string;

  lastChangedBy: string;

  enrollment: LabourEnrollment;
}
