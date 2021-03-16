import { IsNotEmpty } from 'class-validator';
import { Patient } from '../../entities/patient.entity';

export class LabourEnrollmentDto {
    @IsNotEmpty()
    husbandName: string;

    @IsNotEmpty()
    husbandPhoneNo: string;

    bloodGroup: string;

    parity: string;

    alive: string;

    miscarriage: string;

    presentPregnancy: string;

    lmp: string;

    createdBy: string;

    lastChangedBy: string;

    patient: Patient;
}
