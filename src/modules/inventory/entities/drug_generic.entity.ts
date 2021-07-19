import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { DrugCategory } from './drug_category.entity';

@Entity({ name: 'drug_generics' })
export class DrugGeneric extends CustomBaseEntity {
    @Column({ type: 'varchar', length: 300 })
    name: string;

    @ManyToOne(type => DrugCategory, { nullable: true })
    @JoinColumn({ name: 'category_id' })
    category: DrugCategory;

    @Column({ type: 'varchar', nullable: true })
    form: string;

    @Column({ type: 'varchar', nullable: true })
    weight: string;

    @Column({ default: 0, name: 'low_stock_level' })
    lowStockLevel: number;
}
