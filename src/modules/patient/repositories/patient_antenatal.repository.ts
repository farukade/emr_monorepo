import { EntityRepository, Repository } from 'typeorm';
import { PatientAntenatal } from '../entities/patient_antenatal.entity';

@EntityRepository(PatientAntenatal)
export class PatientAntenatalRepository extends Repository<PatientAntenatal> {

}
