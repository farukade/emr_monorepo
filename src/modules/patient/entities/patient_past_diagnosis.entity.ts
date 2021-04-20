import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';
import { Encounter } from '../consultation/encouter.entity';

@Entity({ name: 'patient_past_diagnoses' })
export class PatientPastDiagnosis extends CustomBaseEntity {

    @Column({ type: 'jsonb' })
    item: string;

    @Column({ type: 'varchar', nullable: true })
    comment: string;

    @ManyToOne(type => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({ type: 'date', nullable: true, name: 'diagnosed_at' })
    diagnosedAt: Date;

    @ManyToOne(() => Encounter, item => item.pastDiagnoses, { nullable: true, eager: true })
    @JoinColumn({ name: 'encounter_id' })
    encounter: Encounter;

}
