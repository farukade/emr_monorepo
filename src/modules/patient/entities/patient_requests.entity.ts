import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity({name: 'patient_requests'})
export class PatientRequest extends CustomBaseEntity {

    @Column({ nullable: true })
    code: string;

    @Column()
    requestType: string;

    @Column({ type: 'jsonb'})
    requestBody: any;

    @Column({ nullable: true })
    requestNote: string;

    @Column({ type: 'boolean', default: false })
    isFilled: boolean;

    @Column({ type: 'boolean', default: false })
    urgent: boolean;

    @ManyToOne(type => Patient)
    @JoinColumn({name: 'patient_id'})
    patient: Patient;

    @Column({type: 'smallint', default: 0})
    status: number;
}
