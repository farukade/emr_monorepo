import { EntityRepository, Repository } from 'typeorm';
import { PatientDocument } from '../entities/patient_documents.entity';

@EntityRepository(PatientDocument)
export class PatientDocumentRepository extends Repository<PatientDocument> {

}
