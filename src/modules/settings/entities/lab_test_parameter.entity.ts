import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { LabTest } from './lab_test.entity';
import { Parameter } from './parameters.entity';

@Entity({ name: 'lab_test_parameters' })
export class LabTestParameter extends CustomBaseEntity {
    @ManyToOne(
        type => LabTest,
        labTest => labTest.parameters,
    )
    @JoinColumn({ name: 'lab_test_id' })
    public labTest!: LabTest;

    @ManyToOne(type => LabTest)
    @JoinColumn({ name: 'sub_test_id' })
    public subTest!: LabTest;

    @ManyToOne(type => Parameter)
    @JoinColumn({ name: 'parameter_id' })
    public parameter!: Parameter;
}
