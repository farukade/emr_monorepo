import { EntityRepository, Repository } from 'typeorm';
import { IvfTreatmentEntity } from '../entities/treatment.entity';

@EntityRepository(IvfTreatmentEntity)
export class IvfTreatmentRepository extends Repository<IvfTreatmentEntity> {}
