import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { DrugBatch } from './batches.entity';
import { CafeteriaInventory } from './cafeteria_inventory.entity';
import { StoreInventory } from './store_inventory.entity';

@Entity({ name: 'inventory_activities' })
export class InventoryActivity extends CustomBaseEntity {
    @ManyToOne(type => DrugBatch, { nullable: true })
    @JoinColumn({ name: 'drug_batch_id' })
    batch: DrugBatch;

    @ManyToOne(type => StoreInventory, { nullable: true })
    @JoinColumn({ name: 'store_inventory_id' })
    store: StoreInventory;

    @ManyToOne(type => CafeteriaInventory, { nullable: true })
    @JoinColumn({ name: 'cafeteria_inventory_id' })
    cafeteria: CafeteriaInventory;

    @Column({ default: 0 })
    quantity: number;

    @Column({ type: 'float4', default: 0.00, name: 'unit_price' })
    unitPrice: number;
}
