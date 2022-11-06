import { EntityRepository, Repository } from 'typeorm';
import { EmbFreezingEntity } from './freezing.entity';

@EntityRepository(EmbFreezingEntity)
export class EmbFreezingRepository extends Repository<EmbFreezingEntity> {}
