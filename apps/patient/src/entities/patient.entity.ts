import { Entity, Column, Index } from 'typeorm';
import { CustomBaseEntity } from 'apps/emr/src/common/entities/custom-base.entity';

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

  @Column({ name: 'next_of_kin_id', nullable: true })
  nextOfKin: number;

  @Column({ nullable: true })
  last_appointment_date: string;

  @Column({ nullable: true, name: "hmo_scheme_id" })
  hmo: number;

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

  @Column({ name: 'staff_id', nullable: true })
  staff: number;

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

  // @Column((type) => Appointment, (appointment) => appointment.patient)
  // appointments: Appointment[];

  // @OneToMany((type) => Transaction, (transaction) => transaction.patient)
  // transactions: Transaction[];

  // @OneToMany((type) => Immunization, (immunization) => immunization.patient)
  // immunization: Immunization[];

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ nullable: true })
  enrollee_id: string;

  // @OneToMany((type) => IvfEmbryologyEntity, (embryology) => embryology.patient)
  // embryology: IvfEmbryologyEntity;

  @Column({ nullable: true })
  mother_id: number;

  // @OneToMany((type) => IvfHcgAdministrationChartEntity, (hcg) => hcg.patient)
  // hcg: IvfHcgAdministrationChartEntity;
}