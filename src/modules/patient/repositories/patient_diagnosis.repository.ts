import { EntityRepository, Repository } from 'typeorm';
import { PatientDiagnosis } from '../entities/patient_diagnosis.entity';

@EntityRepository(PatientDiagnosis)
export class PatientDiagnosisRepository extends Repository<PatientDiagnosis> {

}
