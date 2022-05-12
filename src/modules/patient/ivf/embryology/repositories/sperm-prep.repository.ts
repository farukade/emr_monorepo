import { EntityRepository, Repository } from 'typeorm';
import { IvfSpermPreparationEntity } from '../entities/sperm-prep.entity';

@EntityRepository(IvfSpermPreparationEntity)
export class IvfSpermPrepRepository extends Repository<IvfSpermPreparationEntity> {}
