import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { GroupTest } from './group_tests.entity';
import { HmoScheme } from '../../hmo/entities/hmo_scheme.entity';

@Entity({ name: 'lab_groups' })
export class Group extends CustomBaseEntity {
    @Column({ type: 'varchar', length: 300 })
    name: string;

    @Column({ type: 'varchar', nullable: true})
    slug: string;

    @Column({type: 'varchar', nullable: true})
    description: string;

    @OneToMany(type => GroupTest, items => items.group)
    tests: GroupTest;
}
