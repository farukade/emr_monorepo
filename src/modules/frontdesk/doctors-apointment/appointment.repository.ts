import { EntityRepository, Repository } from 'typeorm';
import { DoctorsAppointment } from './appointment.entity';

@EntityRepository(DoctorsAppointment)
export class DoctorsAppointmentRepository extends Repository<
	DoctorsAppointment
> {}
