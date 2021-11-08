import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { LabTestCategory } from './lab_test_category.entity';

@Entity({ name: 'lab_tests' })
export class LabTest extends CustomBaseEntity {

    @Column({ type: 'varchar', nullable: true })
    code: string;

    @Column({ type: 'varchar', length: 300 })
    name: string;

    @ManyToOne(type => LabTestCategory, { eager: true })
    @JoinColumn({ name: 'lab_test_category_id' })
    category: LabTestCategory;

    @Column({ type: 'jsonb', nullable: true })
    specimens: any;

    @Column({ type: 'jsonb', nullable: true })
    parameters: any[];

    @Column({ type: 'boolean', default: false })
    hasParameters: boolean;

    @Column({ type: 'jsonb', nullable: true })
    subTests: any;

}
