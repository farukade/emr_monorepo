import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, JoinColumn, Column, OneToOne, BeforeInsert } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { ConsultingRoom } from '../../settings/entities/consulting-room.entity';
import { ServiceCategory } from '../../settings/entities/service_category.entity';
import { Encounter } from '../../patient/consultation/encouter.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { Transaction } from '../../finance/transactions/entities/transaction.entity';
import { Department } from '../../settings/entities/department.entity';
import { ServiceCost } from '../../settings/entities/service_cost.entity';
import { AntenatalAssessment } from '../../patient/antenatal/entities/antenatal-assessment.entity';
import * as moment from 'moment';

@Entity({ name: 'appointments' })
export class Appointment extends CustomBaseEntity {
  @ManyToOne(() => Patient, (patient) => patient.appointments)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne((type) => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne((type) => StaffDetails)
  @JoinColumn({ name: 'doctor_id' })
  whomToSee: StaffDetails;

  @ManyToOne((type) => ConsultingRoom, { nullable: true })
  @JoinColumn({ name: 'consulting_room_id' })
  consultingRoom: ConsultingRoom;

  @ManyToOne((type) => ServiceCategory, { eager: true })
  @JoinColumn({ name: 'service_category_id' })
  serviceCategory: ServiceCategory;

  @ManyToOne((type) => ServiceCost, { eager: true })
  @JoinColumn({ name: 'service_cost_id' })
  service: ServiceCost;

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true })
  duration_type: string;

  @Column({ nullable: true })
  appointment_date: string;

  @Column({ nullable: true })
  referredBy: string;

  @Column({ nullable: true })
  referralCompany: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'Pending' })
  status: string;

  @Column({ type: 'varchar', default: 'patient' })
  appointmentType: string;

  @Column({ type: 'varchar', nullable: true })
  consultation_type: string;

  @Column({ type: 'smallint', default: 0 })
  doctorStatus: number;

  @Column({ type: 'smallint', default: 0 })
  canSeeDoctor: number;

  @OneToOne((type) => Encounter, (item) => item.appointment, { eager: true })
  encounter: Encounter;

  @OneToOne((type) => AntenatalAssessment, (item) => item.appointment, { eager: true })
  assessment: AntenatalAssessment;

  @OneToOne((type) => Transaction, { nullable: true })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  is_covered: boolean;

  @Column({ type: 'boolean', default: false })
  is_scheduled: boolean;

  @Column({ type: 'boolean', default: false })
  is_queued: boolean;

  @BeforeInsert()
  updateIsSchedule() {
    this.is_scheduled = moment(this.appointment_date).format('DDMMYYYY') !== moment().format('DDMMYYYY');
  }
}
