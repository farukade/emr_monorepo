import { EntityRepository, Repository } from 'typeorm';
import { HmoDto } from './dto/hmo.dto';
import { Hmo } from './hmo.entity';

@EntityRepository(Hmo)
export class HmoRepository extends Repository<Hmo> {

    async saveHmo(hmoDto: HmoDto, logo): Promise<Hmo> {
        const { name, address, phoneNumber, email }  = hmoDto;
        const hmo       = new Hmo();
        hmo.name        = name.toLocaleLowerCase();
        // hmo.logo        = logo;
        hmo.address     = address;
        hmo.phoneNumber = phoneNumber;
        hmo.email       = email;
        await hmo.save();
        return hmo;
    }
}
