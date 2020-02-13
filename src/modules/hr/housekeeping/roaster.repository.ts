import { EntityRepository, Repository } from 'typeorm';
import { Roaster } from '../entities/roaster.entity';

@EntityRepository(Roaster)
export class RoasterRepository extends Repository<Roaster> {
}
