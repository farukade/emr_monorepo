import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Admission } from './admission.entity';
import { Patient } from '../../entities/patient.entity';
import { PatientVital } from '../../entities/patient_vitals.entity';
import { PatientRequest } from '../../entities/patient_requests.entity';
import { Nicu } from '../../nicu/entities/nicu.entity';
import { LabourEnrollment } from '../../labour-management/entities/labour_enrollment.entity';

@Entity({ name: 'clinical_tasks' })
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

  @Column({ type: 'jsonb', nullable: true })
  drug: any;

  @Column({ nullable: true })
  dose: string;

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

  @ManyToOne(() => Admission, { nullable: true })
  @JoinColumn({ name: 'admission_id' })
  admission: Admission;

  @ManyToOne(() => Nicu, { nullable: true })
  @JoinColumn({ name: 'nicu_id' })
  nicu: Nicu;

  @ManyToOne(() => LabourEnrollment, { nullable: true })
  @JoinColumn({ name: 'labour_id' })
  labour: LabourEnrollment;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @OneToMany((type) => PatientVital, (vital) => vital.task)
  vitals: PatientVital;

  @ManyToOne((type) => PatientRequest, (r) => r.task, { nullable: true })
  @JoinColumn({ name: 'request_id' })
  request: PatientRequest;
}
