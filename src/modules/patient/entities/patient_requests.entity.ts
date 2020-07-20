import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity({name: 'patient_requests'})
export class PatientRequest extends CustomBaseEntity {

    @Column()
    requestType: string;

    @Column({ type: 'jsonb'})
    requestBody: string;

    @Column({ nullable: true })
    requestNote: string;

    @Column({ type: 'boolean', default: false })
    isFilled: boolean;

    @ManyToOne(type => Patient)
    @JoinColumn({name: 'patient_id'})
    patient: Patient;

    @Column({type: 'smallint', default: 0})
    status: number;
}
