import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';

@Entity({name: 'patient_vitals'})
export class PatientVital extends CustomBaseEntity {

    @Column()
    readingType: string;

    @Column({ type: 'jsonb'})
    reading: string;

    @ManyToOne(type => Patient)
    patient: Patient;
}
