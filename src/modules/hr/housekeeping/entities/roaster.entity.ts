import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { ManyToOne, Column, Entity, JoinColumn } from 'typeorm';
import { Department } from '../../../settings/entities/department.entity';

@Entity({ name: 'roasters' })
export class Roaster extends CustomBaseEntity {
    @ManyToOne(type => Department)
    @JoinColumn({ name: 'department_id'})
    department: Department;

    @Column({ type: 'varchar', length: 20})
    period: string;
}
