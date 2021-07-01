import { Repository, EntityRepository } from 'typeorm';
import { NicuAccommodation } from '../entities/nicu-accommodation.entity';

@EntityRepository(NicuAccommodation)
export class NicuAccommodationRepository extends Repository<NicuAccommodation> {

}
