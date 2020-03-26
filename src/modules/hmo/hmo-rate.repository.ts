import { EntityRepository, Repository } from 'typeorm';
import { HmoDto } from './dto/hmo.dto';
import { HmoRate } from './hmo-rate.entity';

@EntityRepository(HmoRate)
export class HmoRateRepository extends Repository<HmoRate> {
}
