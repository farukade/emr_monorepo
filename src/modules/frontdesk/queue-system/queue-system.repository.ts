import { Repository, EntityRepository } from 'typeorm';
import { Queue } from './queue.entity';
import { Appointment } from '../appointment/appointment.entity';

@EntityRepository(Queue)
export class QueueSystemRepository extends Repository<Queue> {

    async saveQueue(appointment: Appointment, queueNumber: number): Promise<Queue> {
        const queue = new Queue();
        queue.queueNumber = queueNumber;
        queue.patientName = appointment.patient.surname + ', ' + appointment.patient.other_names;
        queue.appointment = appointment;
        await queue.save();

        return queue;
    }
}
