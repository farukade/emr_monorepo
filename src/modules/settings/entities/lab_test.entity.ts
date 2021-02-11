import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { LabTestCategory } from './lab_test_category.entity';
import { Hmo } from '../../hmo/entities/hmo.entity';

@Entity({ name: 'lab_tests' })
export class LabTest extends CustomBaseEntity {
    @Column({ type: 'varchar', length: 300 })
    name: string;

    @Column({ type: 'varchar', length: 300 })
    price: string;

    @Column({ type: 'varchar', nullable: true })
    test_type: string;

    @Column({ type: 'varchar', nullable: true })
    slug: string;

    @Column({ type: 'varchar', nullable: true })
    description: string;

    @Column({ type: 'varchar', nullable: true })
    hmoPrice: string;

    @ManyToOne(type => Hmo, { nullable: true })
    @JoinColumn({ name: 'hmo_id' })
    public hmo!: Hmo;

    @ManyToOne(type => LabTestCategory, { eager: true })
    @JoinColumn({ name: 'lab_test_category_id' })
    public category!: LabTestCategory;

    @Column({ type: 'jsonb', nullable: true })
    specimens: string;

    @Column({ type: 'jsonb', nullable: true })
    parameters: any[];

    @Column({ type: 'boolean', default: false })
    hasParameters: boolean;

    @Column({ type: 'jsonb', nullable: true })
    subTests: string;

}
