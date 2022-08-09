import { EntityRepository, Repository } from 'typeorm';
import { IcsiDayRecord } from '../entities/day-record.entity';

@EntityRepository(IcsiDayRecord)
export class DayRecordsRepository extends Repository<IcsiDayRecord> {}
