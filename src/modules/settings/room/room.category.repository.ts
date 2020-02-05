import { EntityRepository, Repository } from 'typeorm';
import { RoomCategory } from '../entities/room_category.entity';
import { RoomCategoryDto } from './dto/room.category.dto';

@EntityRepository(RoomCategory)
export class RoomCategoryRepository extends Repository<RoomCategory> {

    async createCategory(roomCategoryDto: RoomCategoryDto): Promise<RoomCategory> {
        const { name, price, discount } = roomCategoryDto;
        const category = new RoomCategory();
        category.name = name;
        category.price = price;
        category.discount = discount;
        await category.save();
        return category;
    }
}
