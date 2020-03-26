import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';

@Entity({name: 'patient_requests'})
export class PatientRequest extends CustomBaseEntity {

    @Column()
    requestType: string;

    @Column({ type: 'jsonb'})
    requestBody: string;

    @ManyToOne(type => Patient)
    patient: Patient;

    @Column({type: 'smallint', default: 0})
    status: number;
}
