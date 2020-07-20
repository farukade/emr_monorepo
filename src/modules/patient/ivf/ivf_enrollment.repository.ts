import { EntityRepository, Repository } from 'typeorm';
import { IvfEnrollment } from './entities/ivf_enrollment.entity';

@EntityRepository(IvfEnrollment)
export class IvfEnrollmentRepository extends Repository<IvfEnrollment> {}
