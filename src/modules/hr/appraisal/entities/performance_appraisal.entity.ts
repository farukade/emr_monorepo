import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { StaffDetails } from '../../staff/entities/staff_details.entity';
import { Type } from 'class-transformer';
import { Department } from '../../../settings/entities/department.entity';
import { PerformanceIndicator } from './performance_indicator.entity';

@Entity({ name: 'performance_appraisals' })
export class PerformanceAppraisal extends CustomBaseEntity {
    @ManyToOne(() => StaffDetails)
    @JoinColumn({ name: 'staff_id' })
    @Type(() => StaffDetails)
    staff: StaffDetails;

    @ManyToOne(() => StaffDetails)
    @JoinColumn({ name: 'line_manager_id' })
    @Type(() => StaffDetails)
    lineManager: StaffDetails;

    @ManyToOne(() => Department, {nullable: true})
    @JoinColumn({ name: 'department_id' })
    department: Department;

    @OneToMany(type => PerformanceIndicator, indicators => indicators.appraisal, {eager: true, cascade: true})
    indicators: PerformanceIndicator[];
}
