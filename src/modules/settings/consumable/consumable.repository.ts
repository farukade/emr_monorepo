import { Repository, EntityRepository } from 'typeorm';
import { Consumable } from '../entities/consumable.entity';

@EntityRepository(Consumable)
export class ConsumableRepository extends Repository<Consumable> {

}
