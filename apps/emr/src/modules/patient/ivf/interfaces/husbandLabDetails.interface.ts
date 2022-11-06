import { IHormonals } from './hormonals.interface';
import { ISerology } from './serology.interface';
import { ISfaAndrology } from './sfa_andrology.interface';

export class IHusbandLabDetails {
  name: string;
  hormonals: IHormonals;
  serology: ISerology;
  chlamyda: string;
  genotype: string;
  bloodGroup: string;
  randomBloodSugar: string;
  fastingBloodSugar: string;
  sfaAndrology: ISfaAndrology;
}
