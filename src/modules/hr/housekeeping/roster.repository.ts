import { EntityRepository, Repository } from 'typeorm';
import { Roster } from './entities/roster.entity';

@EntityRepository(Roster)
export class RosterRepository extends Repository<Roster> {
}
