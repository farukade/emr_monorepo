import { EntityRepository, Repository } from 'typeorm';
import { Diagnosis } from '../entities/diagnosis.entity';

@EntityRepository(Diagnosis)
export class DiagnosisRepository extends Repository<Diagnosis> {}
