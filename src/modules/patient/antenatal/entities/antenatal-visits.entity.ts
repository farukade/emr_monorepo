import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, Column, OneToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { PatientRequest } from '../../entities/patient_requests.entity';

@Entity({ name: 'antenatal_visits'})
export class AntenatalVisits extends CustomBaseEntity {

    @ManyToOne(() => Patient)
    patient: Patient;

    @Column()
    heightOfFunds: string;

    @Column({nullable: true})
    fetalHeartRate: string;

    @Column({nullable: true})
    positionOfFetus: string;

    @Column({nullable: true})
    fetalLie: string;

    @Column({nullable: true})
    relationshipToBrim: string;

    @Column({nullable: true})
    comment: string;

    @Column({nullable: true})
    nextAppointment: string;

    @Column({name: 'lab_request', type: 'jsonb', nullable: true})
    labRequest: any;

    @OneToOne(() => PatientRequest)
    @JoinColumn({name: 'radiology_request'})
    radiologyRequest: PatientRequest;

    @OneToOne(() => PatientRequest)
    @JoinColumn({name: 'pharmacy_request'})
    pharmacyRequest: PatientRequest;

}
