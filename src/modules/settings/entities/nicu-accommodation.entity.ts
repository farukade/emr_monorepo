import { Entity, Column } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'nicu-accommodations' })
export class NicuAccommodation extends CustomBaseEntity {

    @Column()
    name: string;

    @Column()
    slug: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'float4', nullable: true })
    amount: number;

    @Column({ type: 'int', default: 0 })
    quantity: number;

    @Column({ type: 'int', default: 0 })
    quantity_unused: number;
}
