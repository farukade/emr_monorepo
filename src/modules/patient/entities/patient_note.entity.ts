import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Patient } from './patient.entity';
import { Encounter } from '../consultation/encouter.entity';

@Entity({ name: 'patient_notes' })
export class PatientNote extends CustomBaseEntity {

    @Column({ type: 'text' })
    description: string;

    @Column()
    type: string;

    @ManyToOne(type => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(() => Encounter, item => item.notes, { nullable: true, eager: true })
    @JoinColumn({ name: 'encounter_id' })
    encounter: Encounter;

}
