import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { StaffDetails } from '../../staff/entities/staff_details.entity';
import { Type } from 'class-transformer';
import { Department } from '../../../settings/entities/department.entity';
import { PerformanceIndicator } from './performance_indicator.entity';

@Entity({ name: 'performance_appraisal_periods' })
export class PerformanceAppraisalPeriod extends CustomBaseEntity {

    @Column()
    performancePeriod: string;

    @Column()
    startDate: string;

    @Column()
    endDate: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

}
