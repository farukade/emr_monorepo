import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { CafeteriaInventory } from './cafeteria_inventory.entity';
import { StoreInventory } from './store_inventory.entity';
import { Department } from '../../settings/entities/department.entity';

@Entity({ name: 'requisitions' })
export class Requisition extends CustomBaseEntity {
  @ManyToOne((type) => StaffDetails)
  @JoinColumn({ name: 'staff_id' })
  staff: StaffDetails;

  @ManyToOne((type) => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ type: 'varchar' })
  category: string;

  @ManyToOne((type) => StoreInventory, { nullable: true })
  @JoinColumn({ name: 'store_inventory_id' })
  store: StoreInventory;

  @ManyToOne((type) => CafeteriaInventory, { nullable: true })
  @JoinColumn({ name: 'cafeteria_inventory_id' })
  cafeteria: CafeteriaInventory;

  @Column({ type: 'integer', default: 0 })
  quantity: number;

  @Column({ type: 'smallint', default: 0 })
  approved: number;

  @Column({ type: 'varchar', nullable: true, name: 'approved_by' })
  approvedBy: string;

  @Column({ nullable: true, name: 'approved_at' })
  approvedAt: string;

  @Column({ type: 'smallint', default: 0 })
  declined: number;

  @Column({ type: 'varchar', nullable: true, name: 'declined_by' })
  declinedBy: string;

  @Column({ nullable: true, name: 'declined_at' })
  declinedAt: string;

  @Column({ nullable: true, name: 'decline_reason' })
  declineReason: string;
}
