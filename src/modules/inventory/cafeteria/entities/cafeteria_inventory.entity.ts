import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { CafeteriaInventoryCategory } from './cafeteria_inventory_category.entity';

@Entity({name: 'cafeteria_inventories'})
export class CafeteriaInventory extends CustomBaseEntity {

    @Column({type: 'varchar'})
    name: string;

    @Column({ type: 'varchar', nullable: true})
    stock_code: string;

    @Column({ type: 'varchar', nullable: true})
    description: string;

    @Column({ type: 'varchar', nullable: true})
    cost_price: string;

    @Column({ type: 'varchar', nullable: true})
    quantity: string;

    @ManyToOne(() => CafeteriaInventoryCategory)
    category: CafeteriaInventoryCategory;
}
