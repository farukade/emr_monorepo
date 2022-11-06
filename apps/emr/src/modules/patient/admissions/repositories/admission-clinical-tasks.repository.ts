import { Repository, EntityRepository } from 'typeorm';
import { AdmissionClinicalTask } from '../entities/admission-clinical-task.entity';

@EntityRepository(AdmissionClinicalTask)
export class AdmissionClinicalTaskRepository extends Repository<AdmissionClinicalTask> {}
