import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Entity, Column, JoinColumn, OneToMany, ManyToOne, Index } from 'typeorm';
import { PatientNOK } from './patient-next-of-kin.entity';
import { Appointment } from '../../frontdesk/appointment/appointment.entity';
import { Transaction } from '../../finance/transactions/entities/transaction.entity';
import { Immunization } from '../immunization/entities/immunization.entity';
import { HmoScheme } from '../../hmo/entities/hmo_scheme.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { IvfEmbryologyEntity } from '../ivf/embryology/embryology.entity';
import { IvfHcgAdministrationChartEntity } from '../ivf/entities/ivf_hcg_administration_chart.entity';

@Entity({ name: 'patients' })
export class Patient extends CustomBaseEntity {
  @Index()
  @Column({ type: 'varchar', nullable: true })
  legacy_patient_id: string;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Index()
  @Column({ type: 'varchar' })
  surname: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  profile_pic: string;

  @Index()
  @Column({ type: 'varchar' })
  other_names: string;

  @Column({ type: 'varchar', nullable: true })
  date_of_birth: string;

  @Column({ type: 'varchar', nullable: true })
  occupation: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  phone_number: string;

  @Column({ default: false })
  deceased: boolean;

  @Column({ type: 'varchar' })
  gender: string;

  @Column({ type: 'varchar', nullable: true })
  maritalStatus: string;

  @Column({ type: 'varchar', nullable: true })
  ethnicity: string;

  @Column({ type: 'varchar', nullable: true })
  referredBy: string;

  @ManyToOne((type) => PatientNOK, { nullable: true })
  @JoinColumn({ name: 'next_of_kin_id' })
  nextOfKin: PatientNOK;

  @Column({ nullable: true })
  last_appointment_date: string;

  @ManyToOne((type) => HmoScheme, { nullable: true, eager: true })
  @JoinColumn({ name: 'hmo_scheme_id' })
  hmo: HmoScheme;

  @Column({ nullable: true })
  admission_id: number;

  @Column({ nullable: true })
  nicu_id: number;

  @Column({ nullable: true })
  antenatal_id: number;

  @Column({ nullable: true })
  labour_id: number;

  @Column({ nullable: true })
  ivf_id: number;

  @ManyToOne(() => StaffDetails, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff: StaffDetails;

  @Column({ type: 'float8', default: 0 })
  credit_limit: number;

  @Column({ nullable: true })
  credit_limit_expiry_date: string;

  @Column({ nullable: true })
  blood_group: string;

  @Column({ nullable: true })
  blood_type: string;

  @Column({ default: false })
  is_out_patient: boolean;

  @OneToMany((type) => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];

  @OneToMany((type) => Transaction, (transaction) => transaction.patient)
  transactions: Transaction[];

  @OneToMany((type) => Immunization, (immunization) => immunization.patient)
  immunization: Immunization[];

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ nullable: true })
  enrollee_id: string;

  @OneToMany((type) => IvfEmbryologyEntity, (embryology) => embryology.patient)
  embryology: IvfEmbryologyEntity;

  @Column({ nullable: true })
  mother_id: number;

  @OneToMany((type) => IvfHcgAdministrationChartEntity, (hcg) => hcg.patient)
  hcg: IvfHcgAdministrationChartEntity;
}
