import { Transaction } from 'src/modules/finance/transactions/transaction.entity';
import { StaffDetails } from 'src/modules/hr/staff/entities/staff_details.entity';
import { Patient } from 'src/modules/patient/entities/patient.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { CafeteriaFoodItem } from './food_item.entity';

@Entity({ name: 'cafeteria_orders' })
export class CafeteriaOrder extends CustomBaseEntity {
  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => StaffDetails, { nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff: StaffDetails;

  @Column({ type: 'varchar', nullable: true })
  customer: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @ManyToOne(() => CafeteriaFoodItem, { eager: true })
  @JoinColumn({ name: 'food_item_id' })
  foodItem: CafeteriaFoodItem;

  @Column({ type: 'integer', default: 0 })
  quantity: number;

  @Column({ type: 'smallint', default: 0 })
  status: number;

  @Column({ type: 'float4', default: 0.0 })
  amount: number;

  @Column({ type: 'varchar', nullable: true })
  ready_by: string;

  @Column({ nullable: true })
  ready_at: string;

  @Column({ type: 'varchar', nullable: true })
  cancelled_by: string;

  @Column({ nullable: true })
  cancelled_at: string;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;
}
