import { IsNotEmpty } from 'class-validator';
import { LabourEnrollment } from '../entities/labour_enrollment.entity';

export class LabourVitalDto {
  fetalHeartRate: string;

  cervicalDialation: string;

  fetalHeadDescent: string;

  isMotherAlive: boolean;

  numberOfContractions: string;

  durationOfContractions: string;

  bloodPressure: string;

  currentPulse: string;

  currentTemperature: string;

  bloodSugarLevel: string;

  respirationRate: string;

  nextAction: string;

  enrollment: LabourEnrollment;

  createdBy: string;
  lastChangedBy: string;
}
