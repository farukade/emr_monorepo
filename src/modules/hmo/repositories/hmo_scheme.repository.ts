import { EntityRepository, Repository } from 'typeorm';
import { HmoSchemeDto } from '../dto/hmo_scheme.dto';
import { HmoScheme } from '../entities/hmo_scheme.entity';
import { HmoType } from '../entities/hmo_type.entity';
import { Hmo } from '../entities/hmo.entity';

@EntityRepository(HmoScheme)
export class HmoSchemeRepository extends Repository<HmoScheme> {
  async saveScheme(hmoScheme: HmoSchemeDto, hmo: Hmo, type: HmoType, username: string): Promise<HmoScheme> {
    const { name, address, phoneNumber, email, cacNumber, coverageType, logo } = hmoScheme;

    const scheme = new HmoScheme();
    scheme.name = name;
    scheme.logo = logo;
    scheme.address = address;
    scheme.phoneNumber = phoneNumber;
    scheme.email = email;
    scheme.cacNumber = cacNumber;
    scheme.coverageType = coverageType;
    scheme.hmoType = type;
    scheme.owner = hmo;
    scheme.createdBy = username;
    await scheme.save();

    return scheme;
  }
}
