
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { CafeteriaItemCategory } from './cafeteria_item_category.entity';

@Entity({name: 'cafeteria_items'})
export class CafeteriaItem extends CustomBaseEntity {

    @Column({type: 'varchar'})
    name: string;

    @Column({ type: 'varchar', nullable: true})
    item_code: string;

    @Column({ type: 'varchar', nullable: true})
    description: string;

    @Column({ type: 'float4', nullable: true})
    price: number;

    @Column({ type: 'varchar', nullable: true})
    discount_price: number;

    @ManyToOne(() => CafeteriaItemCategory)
    category: CafeteriaItemCategory;
}
