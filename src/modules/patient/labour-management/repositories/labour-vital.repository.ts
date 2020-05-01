import { EntityRepository, Repository } from 'typeorm';
import { LabourVital } from '../entities/labour_vital.entity';

@EntityRepository(LabourVital)
export class LabourVitalRepository extends Repository<LabourVital> {}
