import { EntityRepository, Repository } from 'typeorm';
import { PatientRequest } from '../entities/patient_requests.entity';

@EntityRepository(PatientRequest)
export class PatientRequestRepository extends Repository<PatientRequest> {}
