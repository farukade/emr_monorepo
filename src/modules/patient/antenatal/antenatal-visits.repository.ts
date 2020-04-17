import { Repository, EntityRepository } from 'typeorm';
import { AntenatalVisits } from './entities/antenatal-visits.entity';

@EntityRepository(AntenatalVisits)
export class AntenatalVisitRepository extends Repository<AntenatalVisits> {

}