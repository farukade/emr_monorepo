import { EntityRepository, Repository } from 'typeorm';
import { IvfEmbryologyEntity } from './embryology.entity';

@EntityRepository(IvfEmbryologyEntity)
export class IvfEmbryologyRepository extends Repository<IvfEmbryologyEntity> {}
