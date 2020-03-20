import { EntityRepository, Repository } from 'typeorm';
import { PatientAllergy } from '../entities/patient_allergies.entity';

@EntityRepository(PatientAllergy)
export class PatientAllergyRepository extends Repository<PatientAllergy> {

}
