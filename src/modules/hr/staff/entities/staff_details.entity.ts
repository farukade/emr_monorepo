import { Type } from 'class-transformer';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Department } from '../../../settings/entities/department.entity';
import { User } from '../../entities/user.entity';
import { Transactions } from '../../../finance/transactions/transaction.entity';
import {Specialization} from "../../../settings/entities/specialization.entity";
import {ConsultingRoom} from "../../../settings/entities/consulting-room.entity";

@Entity({ name: 'staff_details' })
export class StaffDetails extends CustomBaseEntity {

  @Column({ type: 'varchar', length: 300 })
  first_name: string;

  @Column({ type: 'varchar', length: 300 })
  last_name: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  other_names: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 300, nullable:  true })
  phone_number: string;

  @Column({ type: 'varchar', length: 300, unique:  true })
  email: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  nationality: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  state_of_origin: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  lga: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  profile_pic: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  bank_name: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  account_number: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  pension_mngr: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  gender: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  marital_status: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  number_of_children: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  religion: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  date_of_birth: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  next_of_kin: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  next_of_kin_dob: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  next_of_kin_address: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  next_of_kin_relationship: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  next_of_kin_contact_no: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  job_title: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  contract_type: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  employment_start_date: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  annual_salary: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  monthly_salary: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  emp_code: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_consultant: boolean;

  @ManyToOne(type => Department)
  @JoinColumn({name: 'department_id'})
  department: Department;

  @ManyToOne(type => Specialization)
  @JoinColumn({name: 'specialization_id'})
  specialization?: Specialization;

  @ManyToOne(type => ConsultingRoom)
  @JoinColumn({name: 'consulting_room_id'})
  room?: ConsultingRoom;

  @OneToOne(type => User, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(type => Transactions, transaction => transaction.staff)
  transactions!: Transactions;

}
