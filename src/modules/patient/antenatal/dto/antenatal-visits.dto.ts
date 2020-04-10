import { IFathersInfoInterface } from '../interfaces/fathers-info.interface';
import { IPreviousPregnancyInterface } from '../interfaces/previous-pregnancy.interface';
import { IsNotEmpty } from 'class-validator';
import { Patient } from '../../entities/patient.entity';

export class EnrollmentDto {

    @IsNotEmpty()
    bookingPeriod: string;
    requiredCare: string[];
    l_m_p: string;
    lmpSource: string;
    e_o_d: string;
    fathersInfo: IFathersInfoInterface;
    obstericsHistory: string;
    previousPregnancy: IPreviousPregnancyInterface;
    abortion: string;
    patient: Patient;
    createdBy: string;
}