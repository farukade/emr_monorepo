import { Entity, Column, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';
import { PerformanceAppraisal } from './performance_appraisal.entity';

@Entity({ name: 'performance_indicators' })
export class PerformanceIndicator extends CustomBaseEntity {
    @Column()
    keyFocus: string;

    @Column()
    objective: string;

    @Column('simple-array')
    kpis: string[];

    @Column()
    weight: string;

    @ManyToOne(type => PerformanceAppraisal, appraisal => appraisal.indicators)
    appraisal: PerformanceAppraisal;
}
