import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { AdmissionClinicalTask } from '../admissions/entities/admission-clinical-task.entity';

@Entity({ name: 'patient_vitals' })
export class PatientVital extends CustomBaseEntity {

    @Column()
    readingType: string;

    @Column({ type: 'jsonb' })
    reading: string;

    @ManyToOne(type => Patient)
    patient: Patient;

    @ManyToOne(() => AdmissionClinicalTask, task => task.vitals, { nullable: true })
    @JoinColumn({ name: 'clinical_task' })
    task!: AdmissionClinicalTask;
}
