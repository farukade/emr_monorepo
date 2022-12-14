import { Repository, EntityRepository } from 'typeorm';
import { Settings } from './entities/settings.entity';

@EntityRepository(Settings)
export class SettingsRepository extends Repository<Settings> {}
