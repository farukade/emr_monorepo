import { Repository, EntityRepository } from 'typeorm';
import { AntenatalEnrollment } from './entities/antenatal-enrollment.entity';

@EntityRepository(AntenatalEnrollment)
export class AntenatalEnrollmentRepository extends Repository<AntenatalEnrollment> {
}
