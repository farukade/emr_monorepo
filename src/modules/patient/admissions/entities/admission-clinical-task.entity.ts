import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Admission } from './admission.entity';
import { Patient } from '../../entities/patient.entity';
import { PatientVital } from '../../entities/patient_vitals.entity';
import { PatientRequest } from '../../entities/patient_requests.entity';

@Entity({ name: 'admission_clinical_tasks' })
export class AdmissionClinicalTask extends CustomBaseEntity {
    @Column()
    task: string;

    @Column()
    title: string;

    @Column({ default: 'vitals' })
    taskType: string;

    @Column({ nullable: true })
    interval: number;

    @Column({ nullable: true })
    intervalType: string;

    @Column({ type: 'jsonb', nullable: true})
    drug: any;

    @Column({ type: 'int', default: 0 })
    dose: number;

    @Column({ nullable: true })
    frequency: string;

    @Column({ type: 'int', default: 0 })
    taskCount: number;

    @Column({ nullable: true })
    startTime: string;

    @Column({ nullable: true })
    nextTime: string;

    @Column({ type: 'int', default: 0 })
    tasksCompleted: number;

    @Column({ default: false })
    completed: boolean;

    @ManyToOne(() => Admission)
    @JoinColumn({ name: 'admission_id' })
    admission: Admission;

    @ManyToOne(() => Patient)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @OneToMany(type => PatientVital, vital => vital.task)
    vitals: PatientVital;

    @ManyToOne(type => PatientRequest, r => r.task, { nullable: true })
    @JoinColumn({ name: 'request_id' })
    request: PatientRequest;
}
