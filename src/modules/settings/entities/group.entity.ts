import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';
import { Hmo } from '../../hmo/entities/hmo.entity';
import { GroupTest } from './group_tests.entity';

@Entity({ name: 'lab_groups' })
export class Group extends CustomBaseEntity {
    @Column({ type: 'varchar', length: 300 })
    name: string;

    @Column({ type: 'varchar', nullable: true})
    slug: string;

    @Column({type: 'varchar', nullable: true})
    description: string;

    @ManyToOne(type => Hmo, {nullable: true})
    @JoinColumn({ name: 'hmo_id' })
    public hmo!: Hmo;

    @OneToMany(type => GroupTest, items => items.group)
    tests: GroupTest;
}
