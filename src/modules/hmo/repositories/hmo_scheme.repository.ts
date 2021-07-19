import { EntityRepository, Repository } from 'typeorm';
import { HmoSchemeDto } from '../dto/hmo_scheme.dto';
import { HmoScheme } from '../entities/hmo_scheme.entity';

@EntityRepository(HmoScheme)
export class HmoSchemeRepository extends Repository<HmoScheme> {

    async saveScheme(hmoScheme: HmoSchemeDto, hmo, type): Promise<HmoScheme> {
        const { name, address, phoneNumber, email, cacNumber, coverage, coverageType, logo } = hmoScheme;

        const scheme = new HmoScheme();
        scheme.name = name;
        scheme.logo = logo;
        scheme.address = address;
        scheme.phoneNumber = phoneNumber;
        scheme.email = email;
        scheme.cacNumber = cacNumber;
        scheme.coverage = coverage === '' ? null : coverage;
        scheme.coverageType = coverageType;
        scheme.hmoType = type;
        scheme.owner = hmo;
        await scheme.save();

        return scheme;
    }
}
