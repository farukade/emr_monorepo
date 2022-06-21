import { IFathersInfoInterface } from '../interfaces/fathers-info.interface';
import { IPreviousPregnancyInterface } from '../interfaces/previous-pregnancy.interface';

export class EnrollmentDto {
  patient_id: string;
  bookingPeriod: string;
  doctors: any;
  lmp: string;
  lmpSource: string;
  edd: string;
  father: IFathersInfoInterface;
  history: any;
  previousPregnancy: IPreviousPregnancyInterface;
  enrollment_package_id: any;
}
