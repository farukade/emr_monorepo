import { IAllergyInterface } from '../interfaces/allergy.interface';
import { IDiagnosisInterface } from '../interfaces/diagnosis.interface';

export class EncounterDto {
    complaints: string;
    reviewOfSystem: string[];
    patientHistory: string[];
    medicalHistory: string[];
    allergies: IAllergyInterface[];
    physicalExamination: string[];
    physicalExaminationSummary: string;
    diagnosis: IDiagnosisInterface[];
    investigations: {
        labRequest: any;
        imagingRequest: any;
    };
    plan: {
        treatmentPlan: string;
        pharmacyRequests: any;
        nextAppointment: any;
        procedureRequest: any;
    };

    consumable: {
        items: string[];
        note: string;
        instruction: string;
    };
}
