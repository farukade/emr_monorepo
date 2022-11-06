import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { LabourEnrollment } from './labour_enrollment.entity';
import { Patient } from '../../entities/patient.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';

@Entity({ name: 'labour_delivery_records' })
export class LabourDeliveryRecord extends CustomBaseEntity {
  @ManyToOne(() => LabourEnrollment)
  @JoinColumn({ name: 'enrollment_id' })
  enrolment: LabourEnrollment;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ nullable: true })
  delivery_type: string;

  @Column({ nullable: true })
  is_mother_alive: string;

  @Column({ nullable: true })
  is_baby_alive: string;

  @Column({ nullable: true })
  administered_oxytocin: string;

  @Column({ nullable: true })
  placenta_delivered: string;

  @Column({ nullable: true })
  normal_bleeding: string;

  @Column({ nullable: true })
  date_of_birth: string;

  @Column({ nullable: true })
  time_of_birth: string;

  @Column({ nullable: true })
  baby_cried_immediately: string;

  @Column({ nullable: true })
  sex_of_baby: string;

  @Column({ nullable: true })
  apgar_score: string;

  @Column({ nullable: true })
  weight: string;

  @Column({ nullable: true })
  administered_vitamin_k: string;

  @Column({ nullable: true })
  mother_rh_negative: string;

  @Column({ nullable: true })
  drugs_administered: string;

  @Column({ nullable: true })
  transferred_to: string;

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(() => StaffDetails, { nullable: true })
  @JoinColumn({ name: 'pediatrician_id' })
  pediatrician: StaffDetails;
}
