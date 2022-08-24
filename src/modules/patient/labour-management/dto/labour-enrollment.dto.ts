import { IFathersInfoInterface } from '../../antenatal/interfaces/fathers-info.interface';

export class LabourEnrollmentDto {
  patient_id: string;
  antenatal_id: string;
  lmp: string;
  father: IFathersInfoInterface;
  alive: string;
  miscarriage: string;
  present_pregnancies: string;
}
