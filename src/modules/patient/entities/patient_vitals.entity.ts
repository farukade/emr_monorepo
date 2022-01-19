import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { AdmissionClinicalTask } from '../admissions/entities/admission-clinical-task.entity';

@Entity({ name: 'patient_vitals' })
export class PatientVital extends CustomBaseEntity {

    @Column()
    readingType: string;

    @Column({ type: 'jsonb' })
    reading: any;

    @ManyToOne(type => Patient)
    patient: Patient;

    @ManyToOne(() => AdmissionClinicalTask, task => task.vitals, { nullable: true })
    @JoinColumn({ name: 'clinical_task' })
    task!: AdmissionClinicalTask;

    @Column({ type: 'boolean', default: false, name: 'is_abnormal' })
    isAbnormal: boolean;

    @Column({ nullable: true })
    admission_id: number;

    @Column({ nullable: true })
    nicu_id: number;

    @Column({ nullable: true })
    labour_id: number;
}
