import { EntityRepository, Repository } from 'typeorm';
import { IvfEmbryoAssessment } from '../entities/embryo-assessment.entity';

@EntityRepository(IvfEmbryoAssessment)
export class IvfEmbryoAssessmentRepository extends Repository<IvfEmbryoAssessment> {}
