import { Entity, Column, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { PerformanceAppraisal } from './performance_appraisal.entity';
import { PerformanceAppraisalPeriod } from './performance_appraisal_period.entity';

@Entity({ name: 'performance_comments' })
export class PerformanceComment extends CustomBaseEntity {

    @Column({ nullable: true})
    employeeComment: string;

    @Column({ nullable: true})
    lineManagerComment: string;

    @Column({ nullable: true})
    recommendation: string;

    @ManyToOne(type => PerformanceAppraisal, appraisal => appraisal.indicators)
    appraisal: PerformanceAppraisal;

    @ManyToOne(type => PerformanceAppraisalPeriod)
    period: PerformanceAppraisalPeriod;
}
