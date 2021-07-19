import { Entity, Column } from 'typeorm';
import { CustomBaseEntity } from '../../../common/entities/custom-base.entity';

@Entity({ name: 'activities' })
export class Activity extends CustomBaseEntity {

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    slug: string;

    @Column({ type: 'varchar', nullable: true })
    description: string;

    @Column({ type: 'varchar', name: 'table_id' })
    tableId: string;

    @Column({ type: 'varchar', name: 'table_name' })
    tableName: string;

    @Column({ type: 'varchar', name: 'data', nullable: true })
    data: string;
}
