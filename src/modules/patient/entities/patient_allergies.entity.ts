import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';

@Entity({name: 'patient_allergies'})
export class PatientAllergy extends CustomBaseEntity {

    @Column()
    category: string;

    @Column()
    allergy: string;

    @Column()
    severity: string;

    @Column()
    reaction: string;

    @ManyToOne(type => Patient)
    patient: Patient;
}
