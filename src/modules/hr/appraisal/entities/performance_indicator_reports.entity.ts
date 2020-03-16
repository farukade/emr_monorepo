import { Entity, Column, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { PerformanceAppraisal } from './performance_appraisal.entity';
import { PerformanceAppraisalPeriod } from './performance_appraisal_period.entity';
import { PerformanceIndicator } from './performance_indicator.entity';

@Entity({ name: 'performance_indicator_reports' })
export class PerformanceIndicatorReport extends CustomBaseEntity {

    @Column({nullable: true})
    selfAssessment: string;

    @Column({nullable: true})
    lineManagerAssessment: string;

    @ManyToOne(type => PerformanceAppraisal, appraisal => appraisal.indicators)
    appraisal: PerformanceAppraisal;

    @ManyToOne(type => PerformanceIndicator)
    indicator: PerformanceIndicator;

    @ManyToOne(type => PerformanceAppraisalPeriod)
    period: PerformanceAppraisalPeriod;
}
