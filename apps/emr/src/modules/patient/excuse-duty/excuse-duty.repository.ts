import { Repository, EntityRepository } from 'typeorm';
import { PatientExcuseDuty } from '../entities/patient_excuse_duty.entity';

@EntityRepository(PatientExcuseDuty)
export class ExcuseDutyRepository extends Repository<PatientExcuseDuty> {}
