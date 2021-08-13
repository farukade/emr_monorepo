import { EntityRepository, Repository } from 'typeorm';
import { RoomCategory } from '../entities/room_category.entity';

@EntityRepository(RoomCategory)
export class RoomCategoryRepository extends Repository<RoomCategory> {
}
