import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';
import { LabourEnrollment } from './labour_enrollment.entity';
import { PatientRequest } from '../../entities/patient_requests.entity';

@Entity({name: 'labour_measurements'})
export class LabourMeasurement extends CustomBaseEntity {

    @Column({nullable: true})
    isFalseLabour: boolean;

    @Column({nullable: true})
    presentation: string;

    @Column({nullable: true})
    positionOfFoetus: string;

    @Column({nullable: true})
    fetalLies: string;

    @Column({nullable: true})
    descent: string;

    @Column({nullable: true})
    cervicalLength: string;

    @Column({nullable: true})
    cervicalEffacement: string;

    @Column({nullable: true})
    cervicalPosition: string;

    @Column({nullable: true})
    membranes: string;

    @Column({nullable: true})
    moulding: string;

    @Column({nullable: true})
    caput: string;

    @Column({nullable: true})
    hasPassedUrine: boolean;

    @Column({nullable: true})
    administeredCyatacin: boolean;

    @Column({nullable: true})
    administeredDrugs: boolean;

    @Column()
    timeOfMeasurement: string;

    @Column()
    dateOfMeasurement: string;

    @Column('simple-array', {nullable: true})
    measurements: string[];

    @ManyToOne(() => StaffDetails)
    examiner: StaffDetails;

    @ManyToOne(() => LabourEnrollment)
    enrollment: LabourEnrollment;

    @OneToOne(type => PatientRequest)
    @JoinColumn({ name: 'request_id' })
    request: PatientRequest;
}
