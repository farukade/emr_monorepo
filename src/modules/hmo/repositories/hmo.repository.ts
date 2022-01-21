import { EntityRepository, Repository } from 'typeorm';
import { HmoDto } from '../dto/hmo.dto';
import { Hmo } from '../entities/hmo.entity';

@EntityRepository(Hmo)
export class HmoOwnerRepository extends Repository<Hmo> {

    async saveHmo(hmoDto: HmoDto, username: string): Promise<Hmo> {
        const { name, address, phoneNumber, email } = hmoDto;

        const hmo = new Hmo();
        hmo.name = name;
        hmo.address = address;
        hmo.phoneNumber = phoneNumber;
        hmo.email = email;
        hmo.createdBy = username;
        await hmo.save();

        return hmo;
    }
}
