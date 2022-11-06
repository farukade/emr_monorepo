import { EntityRepository, Repository } from 'typeorm';
import { Biopsy } from '../entities/biopsy.entity';

@EntityRepository(Biopsy)
export class BiopsyRepository extends Repository<Biopsy> {}
