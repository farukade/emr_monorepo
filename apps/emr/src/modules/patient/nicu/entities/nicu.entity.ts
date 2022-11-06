import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Patient } from '../../entities/patient.entity';
import { Admission } from '../../admissions/entities/admission.entity';
import { NicuAccommodation } from '../../../settings/entities/nicu-accommodation.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';
import { AdmissionClinicalTask } from '../../admissions/entities/admission-clinical-task.entity';

@Entity({ name: 'nicu' })
export class Nicu extends CustomBaseEntity {
  @ManyToOne((type) => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ nullable: true })
  health_state: string;

  @ManyToOne(() => NicuAccommodation, { nullable: true })
  @JoinColumn({ name: 'accommodation_id' })
  accommodation: NicuAccommodation;

  @Column({ nullable: true })
  accommodation_assigned_at: string;

  @Column({ type: 'varchar', nullable: true })
  accommodation_assigned_by: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @OneToMany(() => AdmissionClinicalTask, (tasks) => tasks.nicu)
  tasks: AdmissionClinicalTask;

  @Column({ type: 'smallint', default: 0 })
  status: number;

  @Column({ default: false })
  start_discharge: boolean;

  @Column({ nullable: true })
  start_discharge_date: string;

  @Column({ type: 'varchar', nullable: true })
  start_discharge_by: string;

  @Column({ nullable: true })
  date_discharged: string;

  @ManyToOne(() => StaffDetails, { nullable: true })
  @JoinColumn({ name: 'discharged_by' })
  dischargedBy: StaffDetails;
}
