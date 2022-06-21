import { IAllergyInterface } from '../interfaces/allergy.interface';
import { IDiagnosisInterface } from '../interfaces/diagnosis.interface';
import { IInvestigationInterface } from '../interfaces/investigations.interface';

export class EncounterDto {
  complaints: string;
  reviewOfSystem: any[];
  patientHistorySelected: any[];
  medicalHistory: string;
  allergies: IAllergyInterface[];
  physicalExamination: any[];
  physicalExaminationNote: string;
  diagnosis: IDiagnosisInterface[];
  investigations: IInvestigationInterface;
  treatmentPlan: string;
  nextAppointment: {
    datetime: string;
    duration: string;
    duration_type: string;
    doctor_id: any;
  };
  instruction: string;
  consumables: {
    patient_id: number;
    items: any[];
    request_note: string;
  };
}
