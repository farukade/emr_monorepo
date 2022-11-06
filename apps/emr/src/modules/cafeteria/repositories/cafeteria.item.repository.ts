import { EntityRepository, Repository } from 'typeorm';
import { CafeteriaItem } from '../entities/cafeteria_item.entity';

@EntityRepository(CafeteriaItem)
export class CafeteriaItemRepository extends Repository<CafeteriaItem> {}
