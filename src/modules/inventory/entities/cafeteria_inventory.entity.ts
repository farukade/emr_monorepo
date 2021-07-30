import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Vendor } from './vendor.entity';

@Entity({ name: 'cafeteria_inventories' })
export class CafeteriaInventory extends CustomBaseEntity {

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar', nullable: true })
    code: string;

    @Column({ type: 'varchar', nullable: true, name: 'unit_of_measure' })
    unitOfMeasure: string;

    @Column({ type: 'integer', default: 0 })
    quantity: number;

    @Column({ type: 'float4', default: 0.0, name: 'unit_price' })
    unitPrice: number;
}
