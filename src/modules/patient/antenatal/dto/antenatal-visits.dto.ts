import { IFathersInfoInterface } from '../interfaces/fathers-info.interface';
import { IPreviousPregnancyInterface } from '../interfaces/previous-pregnancy.interface';
import { IsNotEmpty } from 'class-validator';
import { Patient } from '../../entities/patient.entity';

export class AntenatalVisitDto {

    @IsNotEmpty()
    heightOfFunds: string;
    @IsNotEmpty()
    patient_id: string;
    fetalHeartRate: string;
    positionOfFetus: string;
    fetalLie: string;
    relationshipToBrim: string;
    comment: string;
    nextAppointment: string;
    labRequest: any;
    imagingRequest: any;
    pharmacyRequest: any;
}