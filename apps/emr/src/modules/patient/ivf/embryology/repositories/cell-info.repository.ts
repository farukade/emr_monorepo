import { EntityRepository, Repository } from 'typeorm';
import { CellInfo } from '../entities/cell-info.entity';

@EntityRepository(CellInfo)
export class CellInfoRepository extends Repository<CellInfo> {}
