import { CustomBaseEntity } from 'apps/emr/src/common/entities/custom-base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity({ name: 'patient_alerts' })
export class PatientAlert extends CustomBaseEntity {
  @ManyToOne((type) => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column()
  type: string;

  @Column({ default: 'normal' })
  category: string;

  @Column()
  message: string;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  item_id: number;

  @Column({ default: false })
  closed: boolean;

  @Column({ type: 'varchar', length: 300, nullable: true })
  closed_by: string;

  @Column({ nullable: true })
  closed_at: string;
}