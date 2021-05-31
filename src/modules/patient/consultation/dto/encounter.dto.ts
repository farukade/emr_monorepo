import { IAllergyInterface } from '../interfaces/allergy.interface';
import { IDiagnosisInterface } from '../interfaces/diagnosis.interface';
import { IInvestigationInterface } from '../interfaces/investigations.interface';

export class EncounterDto {
    complaints: string;
    reviewOfSystem: any[];
    patientHistorySelected: any[];
    medicalHistory: string;
    allergies: IAllergyInterface[];
    pastAllergies: any[];
    physicalExamination: any[];
    diagnosis: IDiagnosisInterface[];
    pastDiagnosis: IDiagnosisInterface[];
    investigations: IInvestigationInterface;
    treatmentPlan: string;
    nextAppointment: any;
    instruction: string;
    consumables: {
        patient_id: number;
        items: any[];
        request_note: string;
    };
}
