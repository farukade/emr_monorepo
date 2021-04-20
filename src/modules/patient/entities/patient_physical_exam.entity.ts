import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';
import { Encounter } from '../consultation/encouter.entity';
import { PatientAntenatal } from './patient_antenatal.entity';

@Entity({ name: 'patient_physical_exams' })
export class PatientPhysicalExam extends CustomBaseEntity {
    @Column()
    category: string;

    @Column({ type: 'jsonb', nullable: true })
    description: string;

    @ManyToOne(type => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @ManyToOne(() => Encounter, item => item.physicalExams, { nullable: true, eager: true })
    @JoinColumn({ name: 'encounter_id' })
    encounter: Encounter;

    @ManyToOne(() => PatientAntenatal, item => item.history, { nullable: true, eager: true })
    @JoinColumn({ name: 'antenatal_id' })
    antenatal: PatientAntenatal;

}
