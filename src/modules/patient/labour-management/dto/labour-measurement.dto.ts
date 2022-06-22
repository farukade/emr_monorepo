import { IsNotEmpty } from 'class-validator';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';
import { LabourEnrollment } from '../entities/labour_enrollment.entity';

export class LabourMeasurementDto {
  isFalseLabour: boolean;

  presentation: string;

  positionOfFestus: string;

  fetalLies: string;

  descent: string;

  cervicalLength: string;

  cervicalEffacement: string;

  cervicalPosition: string;

  membrances: string;

  moulding: string;

  caput: string;

  hasPassedUrine: boolean;

  administeredCyatacin: boolean;

  administeredDrugs: boolean;

  timeOfMeasurement: string;

  dateOfMeasurement: string;

  labTests: string[];

  measurements: string[];

  createdBy: string;
  lastChangedBy: string;

  examiner_id: string;

  examiner: StaffDetails;

  enrollment: LabourEnrollment;
}
