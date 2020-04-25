import { IsNotEmpty, IsEmail } from 'class-validator';
import { Patient } from '../entities/patient.entity';

export class ImmunizationDto {

    @IsNotEmpty()
    typeOfVaccine: string;
    @IsNotEmpty()
    dateOfAdministration: string;
    @IsNotEmpty()
    vaccineBatchNo: string;

    prescription: any;

    nextVisitDate: string;
    @IsNotEmpty()
    patient_id: string;

    patient: Patient;

    @IsNotEmpty()
    administeredBy: any;

    createdBy: any;
    lastChangedBy: any;
}
