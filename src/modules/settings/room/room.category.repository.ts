import { EntityRepository, getConnection, Repository } from 'typeorm';
import { RoomCategory } from '../entities/room_category.entity';
import { RoomCategoryDto } from './dto/room.category.dto';
import { HmoScheme } from '../../hmo/entities/hmo_scheme.entity';

@EntityRepository(RoomCategory)
export class RoomCategoryRepository extends Repository<RoomCategory> {

    async createCategory(roomCategoryDto: RoomCategoryDto): Promise<RoomCategory> {
        const { name, price, hmo_id, hmo_tarrif } = roomCategoryDto;

        const hmo = await getConnection().getRepository(HmoScheme).findOne(hmo_id);

        const category = new RoomCategory();
        category.name = name;
        category.price = price;
        category.hmo = hmo;
        category.hmoTarrif = hmo_tarrif;
        await category.save();
        return category;
    }
}
