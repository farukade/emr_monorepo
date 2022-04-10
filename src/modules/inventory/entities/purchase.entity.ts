import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Vendor } from './vendor.entity';

@Entity({ name: 'inventory_purchases' })
export class InventoryPurchase extends CustomBaseEntity {
    @Column({ default: 0 })
    quantity: number;

    @Column({ type: 'float4', default: 0.00 })
    purchase_price: number;

    @ManyToOne(type => Vendor, { nullable: true })
    @JoinColumn({ name: 'vendor_id' })
    vendor: Vendor;

    @Column({ nullable: true })
    item_id: number;

    @Column({ nullable: true })
    item_category: string;
    
    @Column({ type: 'float4', default: 0.00, nullable: true })
    selling_price: number;
}
