import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { LabTest } from './lab_test.entity';
import { Parameter } from './parameters.entity';

@Entity({ name: 'lab_test_parameters' })
export class LabTestParameter extends CustomBaseEntity {

    @Column({type: 'varchar'})
    parameter_type: string;

    @Column({ type: 'varchar', length: 300, nullable: true})
    referenceRange: string;

    @ManyToOne(
        type => LabTest,
        labTest => labTest.parameters,
    )
    @JoinColumn({ name: 'lab_test_id' })
    public labTest!: LabTest;

    @ManyToOne(type => LabTest, {eager: true})
    @JoinColumn({ name: 'sub_test_id' })
    public subTest!: LabTest;

    @ManyToOne(type => Parameter, {eager: true})
    @JoinColumn({ name: 'parameter_id' })
    public parameter!: Parameter;
}
