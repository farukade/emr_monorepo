import { Repository, EntityRepository } from 'typeorm';
import { Encounter } from './encouter.entity';

@EntityRepository(Encounter)
export class EncounterRepository extends Repository<Encounter> {

}