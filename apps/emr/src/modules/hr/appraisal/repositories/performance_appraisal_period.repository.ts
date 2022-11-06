import { EntityRepository, Repository } from 'typeorm';
import { PerformanceAppraisalPeriod } from '../entities/performance_appraisal_period.entity';

@EntityRepository(PerformanceAppraisalPeriod)
export class PerformanceAppraisalPeriodRepository extends Repository<PerformanceAppraisalPeriod> {}
