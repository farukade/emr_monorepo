import { EntityRepository, Repository } from 'typeorm';
import { PatientNote } from '../entities/patient_note.entity';

@EntityRepository(PatientNote)
export class PatientNoteRepository extends Repository<PatientNote> {}
