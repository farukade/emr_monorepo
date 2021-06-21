import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity({ name: 'patient_alerts' })
export class PatientAlert extends CustomBaseEntity {
    @ManyToOne(type => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column()
    type: string;

    @Column()
    message: string;

    @Column({ default: false })
    read: boolean;

    @Column({ type: 'varchar', length: 300, nullable: true, name: 'read_by' })
    readBy: string;
}
