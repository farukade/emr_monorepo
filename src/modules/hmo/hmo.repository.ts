import { EntityRepository, Repository } from 'typeorm';
import { HmoDto } from './dto/hmo.dto';
import { Hmo } from './entities/hmo.entity';

@EntityRepository(Hmo)
export class HmoRepository extends Repository<Hmo> {

    async saveHmo(hmoDto: HmoDto): Promise<Hmo> {
        const { name, address, phoneNumber, email, cacNumber, coverage, coverageType } = hmoDto;

        const hmo = new Hmo();
        hmo.name = name;
        // hmo.logo        = logo;
        hmo.address = address;
        hmo.phoneNumber = phoneNumber;
        hmo.email = email;
        hmo.cacNumber = cacNumber;
        hmo.coverage = coverage;
        hmo.coverageType = coverageType;
        await hmo.save();

        return hmo;
    }
}
