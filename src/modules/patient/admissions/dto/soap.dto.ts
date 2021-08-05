import { IDiagnosisInterface } from '../../consultation/interfaces/diagnosis.interface';

export class SoapDto {
    patient_id: any;
    complaints: string;
    treatmentPlan: string;
    diagnosis: IDiagnosisInterface[];
    pastDiagnosis: IDiagnosisInterface[];
    physicalExaminationSummary: string;
    reviewOfSystem: any[];
}
