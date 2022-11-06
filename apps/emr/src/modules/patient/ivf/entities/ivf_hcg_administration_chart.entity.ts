import { Entity, Column, JoinColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { IvfEnrollment } from './ivf_enrollment.entity';
import { Patient } from '../../entities/patient.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';

@Entity({ name: 'ivf_hcg_administration_charts' })
export class IvfHcgAdministrationChartEntity extends CustomBaseEntity {
  @Column({ nullable: true })
  timeOfEntry: string;

  @Column({ nullable: true })
  timeOfAdmin: string;

  @Column({ nullable: true })
  typeOfHcg: string;

  @Column({ nullable: true })
  typeOfDosage: string;

  @Column({ nullable: true })
  routeOfAdmin: string;

  @Column({ nullable: true })
  remarks: string;

  @ManyToOne(() => IvfEnrollment, { nullable: true })
  @JoinColumn({ name: 'ivf_enrollment_id' })
  ivfEnrollment: IvfEnrollment;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => StaffDetails, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff: StaffDetails;
}
