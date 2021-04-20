import { IsNotEmpty } from 'class-validator';
import { Patient } from '../../entities/patient.entity';

export class PatientConsumableDto {

    @IsNotEmpty()
    cons: string;

    @IsNotEmpty()
    patient_id: string;

    severity: string;

    reaction: string;

    patient: Patient;
}
