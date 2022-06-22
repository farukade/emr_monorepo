import { IHormonals } from './hormonals.interface';
import { ISerology } from './serology.interface';

export class IWifeLabDetails {
  name: string;
  hormonals: IHormonals;
  serology: ISerology;
  chlamyda: string;
  genotype: string;
  bloodGroup: string;
}
