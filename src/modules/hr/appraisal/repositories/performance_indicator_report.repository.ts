import { EntityRepository, Repository } from 'typeorm';
import { PerformanceIndicatorReport } from '../entities/performance_indicator_reports.entity';

@EntityRepository(PerformanceIndicatorReport)
export class PerformanceIndicatorReportRepository extends Repository<PerformanceIndicatorReport> {}
