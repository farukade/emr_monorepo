import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity({ name: 'patient_excuse_duties' })
export class PatientExcuseDuty extends CustomBaseEntity {
  @ManyToOne((type) => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ nullable: true })
  comment: string;

  @Column({ nullable: true })
  start_date: string;

  @Column({ nullable: true })
  end_date: string;
}
