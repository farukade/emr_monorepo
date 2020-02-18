import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'salary_allowances' })
export class SalaryAllowance extends CustomBaseEntity {

    @Column({ type: 'varchar', length: 50})
    label: string;

    @Column({ type: 'varchar', length: 20})
    value: number;
}
