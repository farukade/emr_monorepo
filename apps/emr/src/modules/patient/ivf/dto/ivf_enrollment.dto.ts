import { IWifeLabDetails } from '../interfaces/wifeLabDetails.interface';
import { IHusbandLabDetails } from '../interfaces/husbandLabDetails.interface';
import { Patient } from '../../entities/patient.entity';

export class IvfEnrollmentDto {
  wifeLabDetails: IWifeLabDetails;

  husbandLabDetails: IHusbandLabDetails;

  prognosis: string;

  treatmentPlan: string;
  indication: string;
  assessmentComments: string;
  dateOfCommencement: string;
  dateOfStimulation: string;
  meducationUsed: string;
  endometricThickness: string;
  noOfOocyteRetrieved: string;
  dateOfTreatment: string;
  embryoTransferDate: string;
  noOfEmbryoTransfer: string;
  pregnancyTestDate: string;
  result: string;
  otherComments: string;
  wife: Patient;
  husband: Patient;
}
