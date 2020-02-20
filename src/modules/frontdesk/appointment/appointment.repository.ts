import { EntityRepository, Repository } from 'typeorm';
import { Appointment } from './appointment.entity';

@EntityRepository(Appointment)
export class AppointmentRepository extends Repository<Appointment> {
}
