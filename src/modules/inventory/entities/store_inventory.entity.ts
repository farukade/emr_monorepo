import { Entity, Column } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'store_inventories' })
export class StoreInventory extends CustomBaseEntity {

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    slug: string;

    @Column({ type: 'varchar', nullable: true })
    description: string;

    @Column({ type: 'integer', default: 0 })
    quantity: number;

    @Column({ type: 'float4', default: 0.0, name: 'unit_price' })
    unitPrice: number;

    @Column({ type: 'float8', default: 0.0, name: 'cost_price' })
    costPrice: number;
}
