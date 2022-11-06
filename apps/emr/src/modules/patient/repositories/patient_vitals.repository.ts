import { EntityRepository, Repository } from 'typeorm';
import { PatientVital } from '../entities/patient_vitals.entity';

@EntityRepository(PatientVital)
export class PatientVitalRepository extends Repository<PatientVital> {}
