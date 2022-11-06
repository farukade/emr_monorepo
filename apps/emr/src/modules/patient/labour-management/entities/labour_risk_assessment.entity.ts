import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { LabourEnrollment } from './labour_enrollment.entity';
import { Patient } from '../../entities/patient.entity';

@Entity({ name: 'labour_risk_assessments' })
export class LabourRiskAssessment extends CustomBaseEntity {
  @ManyToOne(() => LabourEnrollment)
  @JoinColumn({ name: 'enrollment_id' })
  enrolment: LabourEnrollment;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ nullable: true })
  risk_score: string;

  @Column({ nullable: true })
  height: string;

  @Column({ nullable: true })
  weight: string;

  @Column({ nullable: true })
  previous_pregnancy_outcome: string;

  @Column({ nullable: true })
  history_low_birth_weight: string;

  @Column('simple-array', { nullable: true })
  previous_pregnancy_experience: string[];

  @Column()
  note: string;
}
