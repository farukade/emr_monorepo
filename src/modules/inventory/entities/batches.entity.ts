import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Drug } from './drug.entity';
import { Vendor } from './vendor.entity';

@Entity({ name: 'drug_batches' })
export class DrugBatch extends CustomBaseEntity {
    @Column({ type: 'varchar', length: 300 })
    name: string;

    @ManyToOne(type => Drug, { eager: true })
    @JoinColumn({ name: 'drug_id' })
    drug: Drug;

    @Column({ default: 0 })
    quantity: number;

    @Column({ type: 'float4', default: 0.0, name: 'unit_price' })
    unitPrice: number;

    @Column({ type: 'float8', default: 0.0, name: 'cost_price' })
    costPrice: number;

    @Column({ type: 'varchar', nullable: true, name: 'expiration_date' })
    expirationDate: string;

    @ManyToOne(type => Vendor, { nullable: true })
    @JoinColumn({ name: 'vendor_id' })
    vendor: Vendor;
}
