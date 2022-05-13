import { EntityRepository, Repository } from 'typeorm';
import { SpermEntity } from '../entities/sperm.entity';

@EntityRepository(SpermEntity)
export class SpermRepository extends Repository<SpermEntity> {}
