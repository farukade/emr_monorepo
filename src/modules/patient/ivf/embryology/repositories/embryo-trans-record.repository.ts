import { EntityRepository, Repository } from 'typeorm';
import { IvfEmbryoTransferRecord } from '../entities/embryo-trans-record.entity';

@EntityRepository(IvfEmbryoTransferRecord)
export class EmbryoTransRecordRepository extends Repository<IvfEmbryoTransferRecord> {}
