import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { LabTest } from './lab_test.entity';
import { Group } from './group.entity';

@Entity({ name: 'lab_group_tests' })
export class GroupTest extends CustomBaseEntity {
    @ManyToOne(type => Group, request => request.tests)
    @JoinColumn({ name: 'group_id' })
    group: Group;

    @ManyToOne(type => LabTest, { nullable: true, eager: true })
    @JoinColumn({ name: 'lab_test_id' })
    labTest: LabTest;
}
