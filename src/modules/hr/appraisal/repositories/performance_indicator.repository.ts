import { EntityRepository, Repository } from 'typeorm';
import { PerformanceIndicator } from '../entities/performance_indicator.entity';

@EntityRepository(PerformanceIndicator)
export class PerformanceIndicatorRepository extends Repository<PerformanceIndicator> {
}
