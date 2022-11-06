import { EntityRepository, Repository } from 'typeorm';
import { BioDeviceUser } from '../entities/bio-device-user.entity';

@EntityRepository(BioDeviceUser)
export class BioUserRepository extends Repository<BioDeviceUser> { }
