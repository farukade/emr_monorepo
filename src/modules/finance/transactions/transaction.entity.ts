import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { Voucher } from '../vouchers/voucher.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { PatientRequestItem } from '../../patient/entities/patient_request_items.entity';
import { Appointment } from '../../frontdesk/appointment/appointment.entity';
import { HmoScheme } from '../../hmo/entities/hmo_scheme.entity';
import { ServiceCost } from '../../settings/entities/service_cost.entity';
import { Admission } from '../../patient/admissions/entities/admission.entity';
import { Nicu } from '../../patient/nicu/entities/nicu.entity';

@Entity({ name: 'transactions' })
export class Transaction extends CustomBaseEntity {
  @ManyToOne(() => Patient, (patient) => patient.transactions, { nullable: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => StaffDetails, (staff) => staff.transactions, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff: StaffDetails;

  @ManyToOne((type) => ServiceCost, { eager: true })
  @JoinColumn({ name: 'service_cost_id' })
  service: ServiceCost;

  @ManyToOne((type) => Voucher, { nullable: true })
  @JoinColumn({ name: 'voucher_id' })
  voucher: Voucher;

  @Column({ type: 'float4', default: 0.0 })
  sub_total: number;

  @Column({ type: 'float4', default: 0.0 })
  vat: number;

  @Column({ type: 'float4', default: 0.0 })
  amount: number;

  @Column({ type: 'float4', default: 0.0 })
  voucher_amount: number;

  @Column({ type: 'float4', default: 0.0 })
  amount_paid: number;

  @Column({ type: 'float4', default: 0.0 })
  change: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  payment_type: string;

  @Column({ nullable: true })
  payment_method: string;

  @Column({ nullable: true })
  transaction_type: string;

  @Column({ nullable: true })
  part_payment_expiry_date: string;

  @Column({ default: false })
  is_admitted: boolean;

  @Column({ nullable: true })
  bill_source: string;

  @Column({ nullable: true })
  next_location: string;

  @Column({ type: 'smallint', default: 0 })
  status: number;

  @Column({ type: 'varchar', nullable: true })
  hmo_approval_code: string;

  @Column({ type: 'jsonb', nullable: true })
  transaction_details: any;

  @ManyToOne((type) => PatientRequestItem, (item) => item.transaction, { nullable: true, eager: true })
  @JoinColumn({ name: 'patient_request_item_id' })
  patientRequestItem: PatientRequestItem;

  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @ManyToOne(() => Admission, { nullable: true })
  @JoinColumn({ name: 'admission_id' })
  admission: Admission;

  @ManyToOne(() => Nicu, { nullable: true })
  @JoinColumn({ name: 'nicu_id' })
  nicu: Nicu;

  @ManyToOne(() => HmoScheme, { nullable: true })
  @JoinColumn({ name: 'hmo_scheme_id' })
  hmo: HmoScheme;
}
