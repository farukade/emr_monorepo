import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

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

    @Column({ type: 'smallint', default: 0 })
    approved: number;

    @Column({ type: 'varchar', nullable: true })
    approved_by: string;

    @Column({ nullable: true })
    approved_at: string;
}
