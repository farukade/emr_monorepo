import { EntityRepository, Repository } from 'typeorm';
import { IvfEmbryoTransfer } from '../entities/embryo-transfer.entity';

@EntityRepository(IvfEmbryoTransfer)
export class IvfEmbryoTranferRepository extends Repository<IvfEmbryoTransfer> {}
