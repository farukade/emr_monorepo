import { EntityRepository, Repository } from 'typeorm';
import { HmoType } from '../entities/hmo_type.entity';
import { HmoTypeDto } from '../dto/hmo_type.dto';

@EntityRepository(HmoType)
export class HmoTypeRepository extends Repository<HmoType> {
  async saveHmoType(hmoTypeDto: HmoTypeDto): Promise<HmoType> {
    const { name } = hmoTypeDto;

    const type = new HmoType();
    type.name = name;
    await type.save();

    return type;
  }
}
