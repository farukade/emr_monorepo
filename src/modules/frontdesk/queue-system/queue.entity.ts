import { Type } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Appointment } from '../appointment/appointment.entity';

@Entity({ name: 'queues' })
export class Queue extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'integer'})
  queueNumber: number;

  @Column({type: 'varchar'})
  patientName: string;

  @OneToOne(() => Appointment)
  @JoinColumn({name: 'appointment_id'})
  appointment: Appointment;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

}
