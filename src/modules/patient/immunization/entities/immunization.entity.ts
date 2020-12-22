import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne, PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { StaffDetails } from '../../../hr/staff/entities/staff_details.entity';

@Entity({ name: 'immunizations' })
export class Immunization extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Patient,
    patient => patient.immunization,
    { nullable: true },
  )
  @JoinColumn({name: 'patient_id'})
  patient: Patient;

  @Column({ type: 'varchar' })
  name_of_vaccine: string;

  @Column({ type: 'varchar', length: 30 })
  slug: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar' })
  date_due: string;

  @Column({ type: 'varchar' })
  period: string;

  @Column({ type: 'varchar', nullable: true })
  appointment_date: string;

  @Column({ type: 'varchar', nullable: true })
  date_administered: string;

  @ManyToOne(type => StaffDetails)
  @JoinColumn({ name: 'staff_id' })
  createdBy: StaffDetails;

  @ManyToOne(type => StaffDetails, s => s.immunizations, { nullable: true })
  @JoinColumn({ name: 'administeredBy' })
  administeredBy: StaffDetails;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updateAt: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
