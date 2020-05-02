import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { LabourEnrollment } from './labour_enrollment.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';

@Entity({name: 'labour_delivery_records'})
export class LabourDeliveryRecord extends CustomBaseEntity {

    @Column()
    deliveryType: string;

    @Column()
    isMotherAlive: boolean;

    @Column()
    isBabyAlive: boolean;

    @Column()
    administeredOxytocin: boolean;

    @Column()
    placentaComplete: boolean;

    @Column()
    bleeading: boolean;

    @Column()
    timeOfBirth: string;

    @Column()
    dateOfBirth: string;

    @Column()
    babyCried: boolean;

    @Column()
    sexOfBaby: string;

    @Column()
    apgarScore: string;

    @Column()
    weight: string;

    @Column()
    administeredVitaminK: boolean;

    @Column()
    negativeRH: boolean;

    @Column({nullable: true})
    drugsAdministered: string;

    @Column()
    transferredTo: string;

    @Column({nullable: true})
    comment: string;

    @ManyToOne(() => StaffDetails)
    pediatrician: StaffDetails;

    @ManyToOne(() => LabourEnrollment)
    enrollement: LabourEnrollment;

}
