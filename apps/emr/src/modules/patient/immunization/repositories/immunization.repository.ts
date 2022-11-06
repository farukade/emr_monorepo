import { EntityRepository, Repository } from 'typeorm';
import { Immunization } from '../entities/immunization.entity';

@EntityRepository(Immunization)
export class ImmunizationRepository extends Repository<Immunization> {}
