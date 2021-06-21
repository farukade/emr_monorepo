
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity({name: 'cafeteria_items'})
export class CafeteriaItem extends CustomBaseEntity {

    @Column({type: 'varchar'})
    name: string;

    @Column({ type: 'varchar', nullable: true})
    description: string;

    @Column({ type: 'float4', nullable: true})
    price: number;

    @Column({ type: 'float4', nullable: true, name: 'discount_price'})
    discountPrice: number;

    @Column({ type: 'integer', default: 0})
    quantity: number;
}
