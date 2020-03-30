import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';

@Entity({name: 'patient_documents'})
export class PatientDocument extends CustomBaseEntity {

    @Column()
    document_type: string;

    @Column()
    document_name: string;

    @ManyToOne(type => Patient)
    patient: Patient;
}
