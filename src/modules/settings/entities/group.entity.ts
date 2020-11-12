import { Column, Entity } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'lab_groups' })
export class Group extends CustomBaseEntity {
    @Column({ type: 'varchar', length: 300, unique: true })
    name: string;

    @Column({type: 'jsonb', nullable: true})
    lab_tests: any;

    @Column({ type: 'varchar', nullable: true})
    slug: string;

    @Column({type: 'varchar', nullable: true})
    description: string;

}
