import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { ManyToOne, Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { Department } from '../../../settings/entities/department.entity';
import { StaffDetails } from '../../staff/entities/staff_details.entity';

@Entity({ name: 'roasters' })
export class Roaster extends CustomBaseEntity {
    @ManyToOne(type => Department)
    @JoinColumn({ name: 'department_id'})
    department: Department;

    @Column({ type: 'varchar', length: 20})
    period: string;

    @ManyToOne(type => StaffDetails, {eager: true})
    @JoinColumn({ name: 'staff_id'})
    staff: StaffDetails;

    @Column({ type: 'jsonb'})
    schedule: string;
}
