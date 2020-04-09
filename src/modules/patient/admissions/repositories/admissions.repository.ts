import { Repository, EntityRepository } from 'typeorm';
import { Admission } from '../entities/admission.entity';

@EntityRepository(Admission)
export class AdmissionsRepository extends Repository<Admission> {

}
