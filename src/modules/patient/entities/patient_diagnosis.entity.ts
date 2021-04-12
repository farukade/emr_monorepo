import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';
import { PatientRequestItem } from './patient_request_items.entity';

@Entity({ name: 'patient_diagnosis' })
export class PatientDiagnosis extends CustomBaseEntity {

    @Column({ type: 'jsonb' })
    item: string;

    @ManyToOne(type => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(() => PatientRequestItem, item => item.diagnosis, { nullable: true })
    @JoinColumn({ name: 'patient_request_item_id' })
    request!: PatientRequestItem;

}
