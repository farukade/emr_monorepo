import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';
import { PatientRequestItem } from './patient_request_items.entity';
import { Encounter } from '../consultation/encouter.entity';

@Entity({ name: 'patient_diagnoses' })
export class PatientDiagnosis extends CustomBaseEntity {

    @Column({ type: 'jsonb' })
    item: string;

    @Column({ type: 'varchar', default: 'Active' })
    status: string;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    comment: string;

    @ManyToOne(type => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(() => PatientRequestItem, item => item.diagnosis, { nullable: true })
    @JoinColumn({ name: 'patient_request_item_id' })
    request!: PatientRequestItem;

    @ManyToOne(() => Encounter, item => item.diagnoses, { nullable: true, eager: true })
    @JoinColumn({ name: 'encounter_id' })
    encounter: Encounter;

}
