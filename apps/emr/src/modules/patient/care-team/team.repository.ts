import { Repository, EntityRepository } from 'typeorm';
import { CareTeam } from './entities/team.entity';

@EntityRepository(CareTeam)
export class CareTeamRepository extends Repository<CareTeam> {}
