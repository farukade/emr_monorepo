import { Repository, EntityRepository } from 'typeorm';
import { AntenatalAssessment } from './entities/antenatal-assessment.entity';

@EntityRepository(AntenatalAssessment)
export class AntenatalAssessmentRepository extends Repository<AntenatalAssessment> {}
