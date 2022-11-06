import { EntityRepository, Repository } from 'typeorm';
import { Bank } from '../entities/bank.entity';

@EntityRepository(Bank)
export class BanksRepository extends Repository<Bank> {}
