import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from '../appointment/appointment.entity';
import { Patient } from '../../patient/entities/patient.entity';

@Entity({ name: 'queues' })
export class Queue extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'integer', nullable: true })
  queueNumber: number;

  @Column({ type: 'varchar' })
  patientName: string;

  @ManyToOne(() => Appointment)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ type: 'varchar', default: 0 })
  queueType: string;

  @Column({ type: 'smallint', default: 0 })
  status: number;

  @Column()
  queueDate: string;

  @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date;

  @Column({ type: 'varchar', length: 300, nullable: true })
  deletedBy: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
