import { EntityRepository, Repository } from 'typeorm';
import { Activity } from '../entities/activity.entity';

@EntityRepository(Activity)
export class ActivityRepository extends Repository<Activity> {}
