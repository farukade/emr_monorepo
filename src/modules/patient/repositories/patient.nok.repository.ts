import { EntityRepository, Repository } from 'typeorm';
import { PatientNOK } from '../patient-next-of-kin.entity';

@EntityRepository(PatientNOK)
export class PatientNOKRepository extends Repository<PatientNOK> {}
