import { Repository, EntityRepository } from 'typeorm';
import { PatientConsumable } from '../entities/patient_consumable.entity';

@EntityRepository(PatientConsumable)
export class PatientConsumableRepository extends Repository<PatientConsumable> {

}
