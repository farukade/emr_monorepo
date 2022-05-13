import { EntityRepository, Repository } from 'typeorm';
import { OocyteEntity } from '../entities/oocyte.entity';

@EntityRepository(OocyteEntity)
export class OocyteRepository extends Repository<OocyteEntity> {}
