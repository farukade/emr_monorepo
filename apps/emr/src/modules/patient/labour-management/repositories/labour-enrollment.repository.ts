import { EntityRepository, Repository } from 'typeorm';
import { LabourEnrollment } from '../entities/labour_enrollment.entity';

@EntityRepository(LabourEnrollment)
export class LabourEnrollmentRepository extends Repository<LabourEnrollment> {}
