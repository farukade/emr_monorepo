import { EntityRepository, Repository } from 'typeorm';
import { LabourMeasurement } from '../entities/labour_measurement.entity';

@EntityRepository(LabourMeasurement)
export class LabourMeasurementRepository extends Repository<LabourMeasurement> {}
