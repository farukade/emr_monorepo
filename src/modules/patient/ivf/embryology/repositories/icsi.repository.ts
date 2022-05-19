import { EntityRepository, Repository } from 'typeorm';
import { IvfICSIEntity } from '../entities/icsi.entity';

@EntityRepository(IvfICSIEntity)
export class IvfICSIRepository extends Repository<IvfICSIEntity> {}
