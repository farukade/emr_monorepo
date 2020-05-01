import { EntityRepository, Repository } from 'typeorm';
import { LabourRiskAssessment } from '../entities/labour_risk_assessment.entity';

@EntityRepository(LabourRiskAssessment)
export class LabourRiskAssessmentRepository extends Repository<LabourRiskAssessment> {}
