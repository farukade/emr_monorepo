import { EntityRepository, Repository } from 'typeorm';
import { PatientAlert } from '../entities/patient_alert.entity';

@EntityRepository(PatientAlert)
export class PatientAlertRepository extends Repository<PatientAlert> {

}
