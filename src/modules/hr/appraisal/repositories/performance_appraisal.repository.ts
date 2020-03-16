import { EntityRepository, Repository } from 'typeorm';
import { PerformanceAppraisal } from '../entities/performance_appraisal.entity';

@EntityRepository(PerformanceAppraisal)
export class PerformanceAppraisalRepository extends Repository<PerformanceAppraisal> {}
