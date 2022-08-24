import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { LabourEnrollment } from './labour_enrollment.entity';
import { Patient } from '../../entities/patient.entity';

@Entity({ name: 'labour_measurements' })
export class LabourMeasurement extends CustomBaseEntity {
  @ManyToOne(() => LabourEnrollment)
  @JoinColumn({ name: 'enrollment_id' })
  enrolment: LabourEnrollment;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ nullable: true })
  labour_sign: string;

  @Column({ nullable: true })
  presentation: string;

  @Column({ nullable: true })
  position_of_foetus: string;

  @Column({ nullable: true })
  fetal_lie: string;

  @Column({ nullable: true })
  descent: string;

  @Column({ nullable: true })
  cervical_length: string;

  @Column({ nullable: true })
  cervical_effacement: string;

  @Column({ nullable: true })
  cervical_position: string;

  @Column({ nullable: true })
  membranes: string;

  @Column({ nullable: true })
  moulding: string;

  @Column({ nullable: true })
  caput: string;

  @Column({ nullable: true })
  has_passed_urine: string;

  @Column({ nullable: true })
  administered_oxytocin: string;

  @Column({ nullable: true })
  administered_other_drugs: string;

  @Column('simple-array', { nullable: true })
  measurements: string[];
}
