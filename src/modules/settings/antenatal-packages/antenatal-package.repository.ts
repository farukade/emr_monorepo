import { Repository, EntityRepository } from 'typeorm';
import { AntenatalPackage } from '../entities/antenatal-package.entity';

@EntityRepository(AntenatalPackage)
export class AntenatalPackageRepository extends Repository<AntenatalPackage> {

}
