import { Entity, Column } from 'typeorm';
import { CustomBaseEntity } from '../../../../common/entities/custom-base.entity';

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
