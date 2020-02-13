import { EntityRepository, Repository } from 'typeorm';
import { Roaster } from '../entities/roaster.entity';
import { RoasterItem } from '../entities/roaster_item.entity';

@EntityRepository(RoasterItem)
export class RoasterItemRepository extends Repository<RoasterItem> {
}
