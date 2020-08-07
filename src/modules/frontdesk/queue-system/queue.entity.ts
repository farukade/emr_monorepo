import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Appointment } from '../appointment/appointment.entity';

@Entity({ name: 'queues' })
export class Queue extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'integer', nullable: true})
  queueNumber: number;

  @Column({type: 'varchar'})
  patientName: string;

  @ManyToOne(() => Appointment)
  @JoinColumn({name: 'appointment_id'})
  appointment: Appointment;

  @Column({type: 'varchar', default: 0})
  queueType: string;

  @Column({type: 'smallint', default: 0})
  status: number;

  @Column()
  createdAt: string;

}
