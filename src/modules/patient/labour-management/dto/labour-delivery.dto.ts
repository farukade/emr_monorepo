import { IsNotEmpty } from 'class-validator';
import { LabourEnrollment } from '../entities/labour_enrollment.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';

export class LabourDeliveryRecordDto {

    deliveryType: string;

    isMotherAlive: boolean;

    isBabyAlive: boolean;

    administeredOxytocin: boolean;

    placentaComplete: boolean;

    bleeading: boolean;

    timeOfBirth: string;

    dateOfBirth: string;

    babyCried: boolean;

    sexOfBaby: string;

    apgarScore: string;

    weight: string;

    administeredVitaminK: boolean;

    negativeRH: boolean;

    drugsAdministered: string;

    transferredTo: string;

    comment: string;

    createdBy: string;

    lastChangedBy: string;

    enrollment: LabourEnrollment;

    pediatrician: StaffDetails;

    pediatrician_id: string;
}
