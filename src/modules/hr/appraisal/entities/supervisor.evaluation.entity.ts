import { Entity, Column } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';

@Entity({ name: 'supervisor_evalutions' })
export class SupervisorEvaluation extends CustomBaseEntity {

    @Column()
    sectionTitle: string;

    @Column('simple-array')
    items: string[];
}
