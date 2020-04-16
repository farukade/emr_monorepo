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

    @Column()
    fetalHeartRate: string;

    @Column()
    positionOfFetus: string;

    @Column()
    fetalLie: string;

    @Column()
    relationshipToBrim: string;

    @Column()
    comment: string;

    @Column()
    nextAppointment: string;

    @OneToOne(() => PatientRequest)
    @JoinColumn({name: 'lab_request'})
    labRequest: PatientRequest;

    @OneToOne(() => PatientRequest)
    @JoinColumn({name: 'radiology_request'})
    radiologyRequest: PatientRequest;

    @OneToOne(() => PatientRequest)
    @JoinColumn({name: 'pharmacy_request'})
    pharmacyRequest: PatientRequest;

}
