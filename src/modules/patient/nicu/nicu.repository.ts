import { Repository, EntityRepository } from 'typeorm';
import { Nicu } from './entities/nicu.entity';

@EntityRepository(Nicu)
export class NicuRepository extends Repository<Nicu> { }