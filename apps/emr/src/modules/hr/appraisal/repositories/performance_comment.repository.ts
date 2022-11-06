import { EntityRepository, Repository } from 'typeorm';
import { PerformanceComment } from '../entities/performance_comments.entity';

@EntityRepository(PerformanceComment)
export class PerformanceCommentRepository extends Repository<PerformanceComment> {}
