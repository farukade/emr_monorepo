import { EntityRepository, Repository } from 'typeorm';
import { PatientAllergen } from '../entities/patient_allergens.entity';

@EntityRepository(PatientAllergen)
export class PatientAllergenRepository extends Repository<PatientAllergen> {

}
