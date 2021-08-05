import { EntityRepository, Repository } from 'typeorm';
import { PatientRequestItem } from '../entities/patient_request_items.entity';

@EntityRepository(PatientRequestItem)
export class PatientRequestItemRepository extends Repository<PatientRequestItem> {
}
