import { EntityRepository, Repository } from 'typeorm';
import { SpermOocyteDonor } from '../entities/donor.entity';

@EntityRepository(SpermOocyteDonor)
export class SpermOocyteDonorRepository extends Repository<SpermOocyteDonor> {}
