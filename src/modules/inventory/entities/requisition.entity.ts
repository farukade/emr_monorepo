import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { DrugBatch } from './batches.entity';
import { CafeteriaInventory } from './cafeteria_inventory.entity';
import { StoreInventory } from './store_inventory.entity';

@Entity({ name: 'requisitions' })
export class Requisition extends CustomBaseEntity {
    @ManyToOne(type => StaffDetails)
    @JoinColumn({ name: 'staff_id' })
    staff: StaffDetails;

    @ManyToOne(type => StoreInventory, { nullable: true })
    @JoinColumn({ name: 'store_inventory_id' })
    storeInventory: StoreInventory;

    @ManyToOne(type => DrugBatch, { nullable: true })
    @JoinColumn({ name: 'drug_batch_id' })
    drugBatch: DrugBatch;

    @ManyToOne(type => CafeteriaInventory, { nullable: true })
    @JoinColumn({ name: 'cafeteria_inventory_id' })
    cafeteriaInventory: CafeteriaInventory;

    @Column({ type: 'integer', default: 0 })
    quantity: number;

    @Column({ type: 'smallint', default: 0 })
    approved: number;

    @Column({ type: 'varchar', nullable: true, name: 'approved_by' })
    approvedBy: string;

    @Column({ nullable: true, name: 'approved_at' })
    approvedAt: string;
}
