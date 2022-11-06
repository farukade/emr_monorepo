import { EntityRepository, Repository } from 'typeorm';
import { LogEntity } from './entities/logger.entity';

@EntityRepository(LogEntity)
export class LoggerRepository extends Repository<LogEntity> {}
